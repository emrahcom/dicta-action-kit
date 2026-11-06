// The capability module of Teamboard, written by hand to the contracts
// (specs/e2e.md, Reference module). It calls the site's own code: the actions
// the buttons call, and the API client for reading.

import { type CapabilityModule, dictaCapabilities } from "dicta-action-js";
import * as actions from "teamboard/actions";
import {
  getTask,
  listTasks,
  listTeammates,
  type Task,
  type Teammate,
} from "teamboard/api";

type Id = { id: string };

const id = { type: "string", description: "The task's id, such as t1" };
const due = { type: "string", description: "Due date, YYYY-MM-DD" };
const teammate = {
  type: "string",
  description: "A teammate's id, from teammates.list",
};
// The same, in a change, where null clears the value.
const newDue = {
  type: ["string", "null"],
  description: "Due date, YYYY-MM-DD, or null to remove it",
};
const newAssignee = {
  type: ["string", "null"],
  description: "A teammate's id, from teammates.list, or null for nobody",
};

const taskOutput = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    due: { type: ["string", "null"], description: "YYYY-MM-DD" },
    done: { type: "boolean" },
    assignee: {
      type: ["object", "null"],
      description: "The teammate, or null for nobody",
      properties: { id: { type: "string" }, name: { type: "string" } },
    },
  },
};

// The most tasks tasks.list returns.
const MAX_TASKS = 50;

// Only the fields a planner needs, with the assignee's name next to the id.
function brief(
  { id, title, due, done, assignee }: Task,
  teammates: Teammate[],
) {
  const teammate = teammates.find((t) => t.id === assignee);
  return {
    id,
    title,
    due,
    done,
    assignee: teammate ? { id: teammate.id, name: teammate.name } : null,
  };
}

// The task's title, for a confirmation the user can read.
async function title(taskId: string) {
  return (await getTask(taskId)).title;
}

const teamboard: CapabilityModule = {
  site: {
    name: "Teamboard",
    desc: "A task list for a small team. One user is signed in. A task has a title, an optional due date, a done flag and an optional assignee, one of the teammates.",
  },
  state: {
    desc: 'The open page: "list", the task list, or "task", one task\'s page, with its id.',
    run: async () => {
      const match = /^\/tasks\/([^/]+)$/.exec(location.pathname);
      return match?.[1]
        ? { page: "task", id: decodeURIComponent(match[1]) }
        : { page: "list" };
    },
  },
  capabilities: {
    ...dictaCapabilities,
    "tasks.list": {
      level: "read",
      desc: `Lists the tasks, all of them or those whose title contains the search text, at most ${MAX_TASKS}.`,
      args: {
        type: "object",
        properties: {
          q: { type: "string", description: "Text the title contains" },
          limit: {
            type: "number",
            description: `The most tasks to return, at most ${MAX_TASKS}, which is the default`,
          },
        },
      },
      output: { type: "array", items: taskOutput },
      run: async ({ q, limit }: { q?: string; limit?: number }) => {
        const [tasks, teammates] = await Promise.all([
          listTasks(q),
          listTeammates(),
        ]);
        const most = Math.max(
          1,
          Math.min(Math.floor(limit ?? MAX_TASKS), MAX_TASKS),
        );
        return tasks.slice(0, most).map((task) => brief(task, teammates));
      },
    },
    "tasks.get": {
      level: "read",
      desc: "Gets one task.",
      args: { type: "object", properties: { id }, required: ["id"] },
      output: taskOutput,
      run: async ({ id }: Id) => {
        const [task, teammates] = await Promise.all([
          getTask(id),
          listTeammates(),
        ]);
        return brief(task, teammates);
      },
    },
    "teammates.list": {
      level: "read",
      desc: "Lists the teammates a task can be assigned to or shared with.",
      output: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
          },
        },
      },
      run: async () => listTeammates(),
    },
    "tasks.add": {
      level: "write",
      desc: "Adds a task.",
      args: {
        type: "object",
        properties: { title: { type: "string" }, due, assignee: teammate },
        required: ["title"],
      },
      output: { type: "object", properties: { id: { type: "string" } } },
      confirm: async ({ title }: { title: string }) =>
        `Add the task "${title}"`,
      run: async (args: { title: string; due?: string; assignee?: string }) => {
        const task = await actions.addTask(
          args.title,
          args.due ?? null,
          args.assignee ?? null,
        );
        return { id: task.id };
      },
    },
    "tasks.update": {
      level: "write",
      desc: "Changes a task's title, due date or assignee, or removes its due date or assignee.",
      args: {
        type: "object",
        properties: {
          id,
          title: { type: "string" },
          due: newDue,
          assignee: newAssignee,
        },
        required: ["id"],
      },
      confirm: async ({ id }: Id) => `Change the task "${await title(id)}"`,
      run: async ({
        id,
        ...changes
      }: Id & {
        title?: string;
        due?: string | null;
        assignee?: string | null;
      }) => {
        await actions.updateTask(id, changes);
      },
    },
    "tasks.setDone": {
      level: "write",
      desc: "Marks a task as done, or as not done.",
      args: {
        type: "object",
        properties: { id, done: { type: "boolean" } },
        required: ["id", "done"],
      },
      confirm: async ({ id, done }: Id & { done: boolean }) =>
        `Mark "${await title(id)}" as ${done ? "done" : "not done"}`,
      run: async ({ id, done }: Id & { done: boolean }) => {
        await actions.setDone(id, done);
      },
    },
    "tasks.delete": {
      level: "destructive",
      desc: "Deletes a task.",
      args: { type: "object", properties: { id }, required: ["id"] },
      confirm: async ({ id }: Id) => `Delete the task "${await title(id)}"`,
      run: async ({ id }: Id) => {
        await actions.deleteTask(id);
      },
    },
    "tasks.share": {
      level: "external",
      desc: "Shares a task with a teammate by email.",
      args: {
        type: "object",
        properties: { id, teammate },
        required: ["id", "teammate"],
      },
      confirm: async ({ id, teammate }: Id & { teammate: string }) => {
        const person = (await listTeammates()).find((t) => t.id === teammate);
        return `Share "${await title(id)}" with ${person?.email ?? teammate}`;
      },
      run: async ({ id, teammate }: Id & { teammate: string }) => {
        await actions.shareTask(id, teammate);
      },
    },
    "pages.openTask": {
      level: "write",
      desc: "Opens a task's page. Loads a page; the steps after it do not run.",
      args: { type: "object", properties: { id }, required: ["id"] },
      pageLoad: true,
      confirm: async ({ id }: Id) => `Open the task "${await title(id)}"`,
      run: async ({ id }: Id) => {
        actions.openTask(id);
      },
    },
    "pages.openList": {
      level: "write",
      desc: "Opens the task list. Loads a page; the steps after it do not run.",
      pageLoad: true,
      confirm: async () => "Open the task list",
      run: async () => {
        location.assign("/");
      },
    },
  },
};

export default teamboard;
