import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api'
import axios from 'axios';
import API_BASE_URL from '../config/api'
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api'
import './NoteEditor.css';
import API_BASE_URL from '../config/api'

const NoteEditor = ({ questionId }) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasNote, setHasNote] = useState(false);

    useEffect(() => {
        if (isOpen && user && questionId) {
            fetchNote();
        }
    }, [isOpen, user, questionId]);

    // Reset when question changes
    useEffect(() => {
        setIsOpen(false);
        setNoteContent('');
        setHasNote(false);
        // We could check if a note exists without opening it, 
        // effectively showing a "View Note" vs "Add Note" button
        checkHasNote();
    }, [questionId]);

    const checkHasNote = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/notes/question/${questionId}`, {
                params: { userId: user.id }
            });
            if (response.data) {
                setHasNote(true);
            } else {
                setHasNote(false);
            }
        } catch (error) {
            // If 404/null, no note exists
            setHasNote(false);
        }
    };

    const fetchNote = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/notes/question/${questionId}`, {
                params: { userId: user.id }
            });
            if (response.data) {
                setNoteContent(response.data.content);
                setHasNote(true);
            } else {
                setNoteContent('');
            }
        } catch (error) {
            console.error('Error fetching note:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!noteContent.trim()) return;

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/notes`, {
                userId: user.id,
                questionId,
                content: noteContent
            });
            setHasNote(true);
            // Optional: Close after save or show success message
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Failed to save note');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;

        setLoading(true);
        try {
            await axios.delete(`${API_BASE_URL}/notes/${questionId}`, {
                params: { userId: user.id }
            });
            setNoteContent('');
            setHasNote(false);
            setIsOpen(false);
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Failed to delete note');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="note-editor-container">
            {!isOpen ? (
                <button
                    className="note-toggle-btn"
                    onClick={() => setIsOpen(true)}
                >
                    <span className="note-icon">{hasNote ? '📝' : '➕'}</span>
                    {hasNote ? 'View/Edit Note' : 'Add Note'}
                </button>
            ) : (
                <div className="note-content">
                    <div className="note-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Your Note</span>
                        <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            onClick={() => setIsOpen(false)}
                        >
                            ✕
                        </button>
                    </div>
                    {loading && !noteContent ? (
                        <div>Loading...</div>
                    ) : (
                        <>
                            <textarea
                                className="note-textarea"
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder="Write your notes here..."
                            />
                            <div className="note-actions">
                                {hasNote && (
                                    <button
                                        className="delete-note-btn"
                                        onClick={handleDelete}
                                        disabled={loading}
                                    >
                                        Delete
                                    </button>
                                )}
                                <button
                                    className="save-note-btn"
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Note'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default NoteEditor;
