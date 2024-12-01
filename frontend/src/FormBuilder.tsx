import React, { useState, useEffect } from "react";
import { create } from "zustand";
import axios from "axios";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Button } from "./components/ui/button";

interface Form {
    title: string;
    description: string;
    fields: { name: string; type: string; required: boolean }[];
}

interface FormState {
    forms: Form[];
    fetchForms: () => Promise<void>;
}

const useFormStore = create<FormState>((set) => ({
    forms: [],
    fetchForms: async () => {
        try {
            const response = await axios.get("/forms");
            set({ forms: response.data });
        } catch (error) {
            console.error("Error fetching forms:", error);
        }
    },
}));

const API_END_POINT = "http://localhost:5000";

const FormBuilder: React.FC = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [fields, setFields] = useState<{ name: string; type: string; required: boolean }[]>([]);
    const [activeTab, setActiveTab] = useState<"form" | "responses">("form");
    const [formLink, setFormLink] = useState<string | null>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);

    const addField = () => setFields([...fields, { name: "", type: "text", required: false }]);

    const createForm = async () => {
        const newForm = {
            title,
            description,
            fields: fields.map((field) => ({
                name: field.name,
                type: field.type,
                required: field.required,
            })),
            createdBy: "user123",
        };
        try {
            const response = await axios.post(`${API_END_POINT}/forms`, newForm);
            const formLink = response.data.link;
            setFormLink(formLink);
            alert(`Form Created! Share this link: ${formLink}`);
            setTitle("");
            setDescription("");
            setFields([]);
        } catch (error: any) {
            console.error("Error creating form:", error);
            alert("Error creating form: " + error.message);
        }
    };

    const fetchSubmissions = async (link: string) => {
        try {
            const response = await axios.get(`${API_END_POINT}/forms/${link}/submissions`);
            setSubmissions(response.data);
        } catch (error) {
            console.error("Error fetching submissions:", error);
        }
    };

    useEffect(() => {
        if (activeTab === "responses" && formLink) {
            fetchSubmissions(formLink);
        }
    }, [activeTab, formLink]);

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Form Builder</h1>

            {/* Tabs */}
            <div className="flex border-b mb-4">
                <button
                    className={`px-4 py-2 font-semibold ${activeTab === "form" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                    onClick={() => setActiveTab("form")}
                >
                    Create Form
                </button>
                <button
                    className={`px-4 py-2 font-semibold ${activeTab === "responses" ? "border-b-2 border-green-500 text-green-500" : "text-gray-500"}`}
                    onClick={() => setActiveTab("responses")}
                >
                    Form Responses
                </button>
            </div>

            {/* Tab content */}
            {activeTab === "form" ? (
                <div>
                    <div className="mb-4">
                        <Label htmlFor="title">Form Title</Label>
                        <Input
                            id="title"
                            type="text"
                            placeholder="Enter form title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border-gray-300 rounded-md"
                        />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="description">Form Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter form description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border-gray-300 rounded-md"
                        />
                    </div>
                    <div className="mb-4">
                        <Button onClick={addField} className="bg-blue-500 text-white hover:bg-blue-600">
                            Add Field
                        </Button>
                    </div>
                    {fields.map((field, index) => (
                        <div key={index} className="mb-4">
                            <Label htmlFor={`field-name-${index}`}>Field Name</Label>
                            <Input
                                id={`field-name-${index}`}
                                type="text"
                                placeholder="Enter field name"
                                value={field.name}
                                onChange={(e) => {
                                    const updatedFields = [...fields];
                                    updatedFields[index].name = e.target.value;
                                    setFields(updatedFields);
                                }}
                                className="w-full border-gray-300 rounded-md"
                            />
                            <Label htmlFor={`field-type-${index}`} className="mt-2">Field Type</Label>
                            <select
                                id={`field-type-${index}`}
                                value={field.type}
                                onChange={(e) => {
                                    const updatedFields = [...fields];
                                    updatedFields[index].type = e.target.value;
                                    setFields(updatedFields);
                                }}
                                className="w-full border-gray-300 rounded-md"
                            >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                            </select>
                            <div className="mt-2 flex items-center">
                                <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => {
                                        const updatedFields = [...fields];
                                        updatedFields[index].required = e.target.checked;
                                        setFields(updatedFields);
                                    }}
                                />
                                <Label htmlFor={`field-required-${index}`} className="ml-2">Required</Label>
                            </div>
                        </div>
                    ))}
                    <div className="mt-4">
                        <Button onClick={createForm} className="w-full bg-green-500 text-white hover:bg-green-600">
                            Create Form
                        </Button>
                    </div>
                </div>
            ) : (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Form Responses</h2>
                    {submissions.length > 0 ? (
                        <ul>
                            {submissions.map((submission, index) => (
                                <li key={index} className="border-b py-2">
                                    <p>User ID: {submission.userId}</p>
                                    <pre className="bg-gray-100 p-2 rounded-md">{JSON.stringify(submission.responses, null, 2)}</pre>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No submissions yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default FormBuilder;