import AutomationRule from '../models/AutomationRule.mjs'; // <- your ES-module model
import Issue from '../models/Issue.mjs';         // <- your Issue model
import Comment from '../models/Comment.mjs';       // <- your Comment model
import sift from 'sift';                        // ES-only import



// POST /projects/:projectId/automations
export const create = async (req, res) => {
  try {
    const rule = new AutomationRule({
      ...req.body,
      projectId: req.params.projectId,
      createdBy: req.user._id,
    });
    await rule.save();
    return res.status(201).json(rule);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Rule name already exists in this project' });
    }
    return res.status(500).json({ error: err.message });
  }
};

// GET /projects/:projectId/automations
export const list = async (req, res) => {
  try {
    const rules = await AutomationRule
      .find({ projectId: req.params.projectId, isDeleted: false })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(+req.query.skip || 0)
      .limit(+req.query.limit || 50);
    return res.json(rules);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /automations/:id
export const get = async (req, res) => {
  try {
    const rule = await AutomationRule.findOne({ _id: req.params.id, isDeleted: false });
    if (!rule) return res.status(404).json({ error: 'Not found' });
    return res.json(rule);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT /automations/:id
export const update = async (req, res) => {
  try {
    const rule = await AutomationRule.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true }
    );
    if (!rule) return res.status(404).json({ error: 'Not found' });
    return res.json(rule);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /automations/:id  (soft)
export const remove = async (req, res) => {
  try {
    const rule = await AutomationRule.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true }
    );
    if (!rule) return res.status(404).json({ error: 'Not found' });
    return res.json({ deleted: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* ---------- RULE RUNNER ---------- */

// Map action.type -> actual function
const registry = {
  assignIssue: async ({ assigneeId }, issue) => {
    await Issue.findByIdAndUpdate(issue._id, { assignee: assigneeId });
  },
  addComment: async ({ body }, issue) => {
    await Comment.create({ issueId: issue._id, body });
  },
  // add more actions here without touching anything else
};

// exported so your Issue hooks can call it
export const runAutomations = async (event, payload) => {
  const rules = await AutomationRule
    .find({ enabled: true, isDeleted: false })
    .lean();

  for (const rule of rules) {
    if (!shouldRun(rule, event, payload)) continue;

    const actions = Array.isArray(rule.actions) ? rule.actions : [rule.actions];

    for (const action of actions) {
      const fn = registry[action.type];
      if (fn) {
        await fn(action, payload).catch((err) =>
          logger.error(`Rule ${rule.name} failed:`, err)
        );
      }
    }
  }
};

// tiny interpreter
function shouldRun(rule, event, payload) {
  const { trigger, conditions } = rule;

  // event name match
  if (trigger.event && trigger.event !== event) return false;

  // JSON condition filter (Mongo style)
  return sift(conditions)(payload);
}