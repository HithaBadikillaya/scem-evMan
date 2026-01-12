const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  title: String,
  description: String,
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
  },
  marks: Number,
  // MCQ specific fields
  questionType: {
    type: String,
    enum: ['Single Correct', 'Multiple Correct', 'Coding'],
  },
  options: [String],
  correctAnswer: String,
  // Coding specific fields
  constraints: String,
  inputFormat: String,
  outputFormat: String,
  boilerplateCode: {
    c: String,
    java: String,
    python: String,
  },
  functionName: String,
  inputVariables: [{
    variable: String,
    type: {
      type: String,
      enum: ['int', 'float', 'char', 'string', 'int_array', 'float_array', 'string_array']
    }
  }],
  testcases: [{
    input: Object,
    output: String
  }],
}, { timestamps: true });

module.exports = mongoose.models.Question || mongoose.model('Question', questionSchema);
