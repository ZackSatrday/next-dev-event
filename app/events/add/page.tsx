"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

export default function AddEventPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        overview: "",
        venue: "",
        location: "",
        date: "",
        time: "",
        mode: "offline",
        audience: "",
        organizer: "",
    });

    const [agendaItems, setAgendaItems] = useState<string[]>([""]);
    const [tags, setTags] = useState<string[]>([""]);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAgendaChange = (index: number, value: string) => {
        const newAgenda = [...agendaItems];
        newAgenda[index] = value;
        setAgendaItems(newAgenda);
    };

    const addAgendaItem = () => {
        setAgendaItems([...agendaItems, ""]);
    };

    const removeAgendaItem = (index: number) => {
        if (agendaItems.length > 1) {
            setAgendaItems(agendaItems.filter((_, i) => i !== index));
        }
    };

    const handleTagChange = (index: number, value: string) => {
        const newTags = [...tags];
        newTags[index] = value;
        setTags(newTags);
    };

    const addTag = () => {
        setTags([...tags, ""]);
    };

    const removeTag = (index: number) => {
        if (tags.length > 1) {
            setTags(tags.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Validate required fields
            if (!imageFile) {
                throw new Error("Please select an image for the event");
            }

            const filteredAgenda = agendaItems.filter((item) => item.trim() !== "");
            const filteredTags = tags.filter((tag) => tag.trim() !== "");

            if (filteredAgenda.length === 0) {
                throw new Error("Please add at least one agenda item");
            }

            if (filteredTags.length === 0) {
                throw new Error("Please add at least one tag");
            }

            // Create FormData for multipart upload
            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                submitData.append(key, value);
            });
            submitData.append("image", imageFile);
            submitData.append("agenda", JSON.stringify(filteredAgenda));
            submitData.append("tags", JSON.stringify(filteredTags));

            const response = await fetch("/api/events", {
                method: "POST",
                body: submitData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to create event");
            }

            // Redirect to the new event page
            router.push(`/events/${result.event.slug}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main>
            {/* Header */}
            <div className="flex flex-col items-start gap-4 mb-8">
                <h1>Create New Event</h1>
                <p className="text-light-200 text-lg max-sm:text-sm">
                    Fill in the details below to create a new event
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg px-4 py-3 mb-6">
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* Basic Info Section */}
                <section className="bg-dark-100 border border-dark-200 rounded-xl p-6 flex flex-col gap-5">
                    <h2 className="font-schibsted-grotesk text-xl font-bold text-light-100 border-b border-dark-200 pb-3 mb-2">
                        Basic Information
                    </h2>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="title" className="text-light-100 text-sm font-medium">
                            Event Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title ?? ""}
                            onChange={handleInputChange}
                            placeholder="Enter event title"
                            required
                            className="bg-dark-200 border border-dark-200 rounded-lg px-4 py-3 text-white placeholder-light-200/50 focus:border-primary focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-light-100 text-sm font-medium">
                            Short Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description ?? ""}
                            onChange={handleInputChange}
                            placeholder="Brief description of the event"
                            rows={3}
                            required
                            className="bg-dark-200 border border-dark-200 rounded-lg px-4 py-3 text-white placeholder-light-200/50 focus:border-primary focus:outline-none transition-colors resize-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="overview" className="text-light-100 text-sm font-medium">
                            Event Overview *
                        </label>
                        <textarea
                            id="overview"
                            name="overview"
                            value={formData.overview ?? ""}
                            onChange={handleInputChange}
                            placeholder="Detailed overview of what the event is about"
                            rows={5}
                            required
                            className="bg-dark-200 border border-dark-200 rounded-lg px-4 py-3 text-white placeholder-light-200/50 focus:border-primary focus:outline-none transition-colors resize-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="image" className="text-light-100 text-sm font-medium">
                            Event Image *
                        </label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            required
                            className="bg-dark-200 border border-dark-200 rounded-lg px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-black file:cursor-pointer hover:file:bg-primary/90"
                        />
                        {imagePreview && (
                            <div className="mt-3 rounded-lg overflow-hidden border border-dark-200 max-w-md">
                                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                            </div>
                        )}
                    </div>
                </section>

                {/* Location & Time Section */}
                <section className="bg-dark-100 border border-dark-200 rounded-xl p-6 flex flex-col gap-5">
                    <h2 className="font-schibsted-grotesk text-xl font-bold text-light-100 border-b border-dark-200 pb-3 mb-2">
                        Location & Time
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="venue" className="text-light-100 text-sm font-medium">
                                Venue *
                            </label>
                            <input
                                type="text"
                                id="venue"
                                name="venue"
                                value={formData.venue ?? ""}
                                onChange={handleInputChange}
                                placeholder="e.g., Convention Center Hall A"
                                required
                                className="bg-dark-200 border border-dark-200 rounded-lg px-4 py-3 text-white placeholder-light-200/50 focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="location" className="text-light-100 text-sm font-medium">
                                Location *
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location ?? ""}
                                onChange={handleInputChange}
                                placeholder="e.g., New York, NY"
                                required
                                className="bg-dark-200 border border-dark-200 rounded-lg px-4 py-3 text-white placeholder-light-200/50 focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="date" className="text-light-100 text-sm font-medium">
                                Date *
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date ?? ""}
                                onChange={handleInputChange}
                                required
                                className="bg-dark-200 border border-dark-200 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="time" className="text-light-100 text-sm font-medium">
                                Time *
                            </label>
                            <input
                                type="time"
                                id="time"
                                name="time"
                                value={formData.time ?? ""}
                                onChange={handleInputChange}
                                required
                                className="bg-dark-200 border border-dark-200 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="mode" className="text-light-100 text-sm font-medium">
                                Mode *
                            </label>
                            <select
                                id="mode"
                                name="mode"
                                value={formData.mode ?? "offline"}
                                onChange={handleInputChange}
                                required
                                className="bg-dark-200 border border-dark-200 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors cursor-pointer"
                            >
                                <option value="offline">Offline (In-Person)</option>
                                <option value="online">Online</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Audience & Organizer Section */}
                <section className="bg-dark-100 border border-dark-200 rounded-xl p-6 flex flex-col gap-5">
                    <h2 className="font-schibsted-grotesk text-xl font-bold text-light-100 border-b border-dark-200 pb-3 mb-2">
                        Audience & Organizer
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="audience" className="text-light-100 text-sm font-medium">
                                Target Audience *
                            </label>
                            <input
                                type="text"
                                id="audience"
                                name="audience"
                                value={formData.audience ?? ""}
                                onChange={handleInputChange}
                                placeholder="e.g., Developers, Designers, Students"
                                required
                                className="bg-dark-200 border border-dark-200 rounded-lg px-4 py-3 text-white placeholder-light-200/50 focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="organizer" className="text-light-100 text-sm font-medium">
                                Organizer *
                            </label>
                            <input
                                type="text"
                                id="organizer"
                                name="organizer"
                                value={formData.organizer ?? ""}
                                onChange={handleInputChange}
                                placeholder="e.g., Tech Community NYC"
                                required
                                className="bg-dark-200 border border-dark-200 rounded-lg px-4 py-3 text-white placeholder-light-200/50 focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </section>

                {/* Agenda Section */}
                <section className="bg-dark-100 border border-dark-200 rounded-xl p-6 flex flex-col gap-5">
                    <h2 className="font-schibsted-grotesk text-xl font-bold text-light-100 border-b border-dark-200 pb-3 mb-2">
                        Event Agenda
                    </h2>
                    <p className="text-light-200 text-sm -mt-3 mb-2">
                        Add the agenda items for your event (at least one required)
                    </p>

                    <div className="flex flex-col gap-3">
                        {agendaItems.map((item, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={item ?? ""}
                                    onChange={(e) => handleAgendaChange(index, e.target.value)}
                                    placeholder={`Agenda item ${index + 1}`}
                                    className="flex-1 bg-dark-200 border border-dark-200 rounded-lg px-4 py-3 text-white placeholder-light-200/50 focus:border-primary focus:outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeAgendaItem(index)}
                                    disabled={agendaItems.length === 1}
                                    className="bg-red-500/20 text-red-400 w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addAgendaItem}
                            className="bg-dark-200 text-light-100 py-2.5 px-4 rounded-lg cursor-pointer hover:bg-dark-200/80 transition-colors text-sm font-medium w-fit"
                        >
                            + Add Agenda Item
                        </button>
                    </div>
                </section>

                {/* Tags Section */}
                <section className="bg-dark-100 border border-dark-200 rounded-xl p-6 flex flex-col gap-5">
                    <h2 className="font-schibsted-grotesk text-xl font-bold text-light-100 border-b border-dark-200 pb-3 mb-2">
                        Tags
                    </h2>
                    <p className="text-light-200 text-sm -mt-3 mb-2">
                        Add tags to help people find your event (at least one required)
                    </p>

                    <div className="flex flex-col gap-3">
                        {tags.map((tag, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={tag ?? ""}
                                    onChange={(e) => handleTagChange(index, e.target.value)}
                                    placeholder={`Tag ${index + 1}`}
                                    className="flex-1 bg-dark-200 border border-dark-200 rounded-lg px-4 py-3 text-white placeholder-light-200/50 focus:border-primary focus:outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeTag(index)}
                                    disabled={tags.length === 1}
                                    className="bg-red-500/20 text-red-400 w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addTag}
                            className="bg-dark-200 text-light-100 py-2.5 px-4 rounded-lg cursor-pointer hover:bg-dark-200/80 transition-colors text-sm font-medium w-fit"
                        >
                            + Add Tag
                        </button>
                    </div>
                </section>

                {/* Submit Button */}
                <div className="flex gap-4 justify-end pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-dark-200 text-light-100 py-3 px-8 rounded-lg cursor-pointer hover:bg-dark-200/80 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary text-black py-3 px-8 rounded-lg cursor-pointer hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Creating Event..." : "Create Event"}
                    </button>
                </div>
            </form>
        </main>
    );
}
