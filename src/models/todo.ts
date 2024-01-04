import { model, Schema } from 'mongoose'

const taskSchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    complete: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
)

const todoSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    todos: {
      type: [taskSchema],
      default: [],
    },
  },
  { timestamps: true }
)

export const Todo = model('Todo', todoSchema)
