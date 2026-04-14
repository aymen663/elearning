import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  pdfUrl: { type: String },
  pdfData: { type: Buffer },
  pdfName: { type: String },
  duration: { type: Number, default: 0 },
  order: { type: Number, required: true },
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    thumbnail: { type: String, default: '' },
    category: { type: String, required: true },
    level: { type: String, enum: ['débutant', 'intermédiaire', 'avancé'], default: 'débutant' },
    lessons: [lessonSchema],
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPublished: { type: Boolean, default: false },

    vectorIds: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);
