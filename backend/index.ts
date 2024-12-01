import express, { Request, Response } from "express";
// import { nanoid } from 'nanoid';
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI!)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error(err));

// Models
const FormSchema = new mongoose.Schema({
    title: String,
    description: String,
    fields: [
        {
            name: { type: String, required: true },
            type: { type: String, required: true },
            required: { type: Boolean, required: true }
        }
    ],
    createdBy: String,
    submissions: [
        {
            userId: String,
            responses: Object
        }
    ],
    formLink: { type: String, unique: true }
});

const Form = mongoose.model("Form", FormSchema);

// Routes
// Create a new form
app.post("/forms", async (req: Request, res: Response): Promise<void> => {
    console.log(req.body);
    
    try {
        const { nanoid } = await import('nanoid');
        const formLink = nanoid(10); // Generates a 10-character unique string
        const form = new Form({
            ...req.body,
            formLink,
        });

        console.log("form", form);
        

        await form.save();
        res.status(201).json({ form, link: `http://localhost:5173/forms/${formLink}` });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// Get a form by ID
app.get("/forms/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) {
            res.status(404).json({ error: "Form not found" });
            return;
        }
        res.json(form);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// Submit a form
app.post("/forms/:formLink/submissions", async (req: Request, res: Response): Promise<void> => {
    try {
        const form = await Form.findOne({ formLink: req.params.formLink });
        if (!form){
            res.status(404).json({ error: "Form not found" });
            return;
        }

        // Add the submission
        form.submissions.push(req.body);
        await form.save();

        res.status(201).json({ message: "Submission successful" });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// Get submissions for a form
app.get("/forms/:formLink/submissions", async (req: Request, res: Response): Promise<void> => {
    try {
        const form = await Form.findOne({ formLink: req.params.formLink });
        if (!form) {
            res.status(404).json({ error: "Form not found" });
            return;
        }
        res.json(form.submissions);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));