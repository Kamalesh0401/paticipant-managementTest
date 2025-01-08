import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    addDocument,
    removeDocument,
    addFile,
    setActiveDocument
} from '../redux/participantsSlice';
import FileDetails from "./FileDetails";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTimes } from '@fortawesome/free-solid-svg-icons';
import "./FileUploader.css";

const FileUploader = () => {
    const dispatch = useDispatch();
    const { participants, activeParticipantIndex, activeDocumentId } = useSelector(
        (state) => state.participants
    );
    const activeParticipant =
        participants.length > 0 ? participants[activeParticipantIndex] : null;

    const [fileInputs, setFileInputs] = useState([]);
    const [fileName, setFileName] = useState("");
    const [showModal, setShowModal] = useState(false);
    const inputRef = useRef();
    const [dragOver, setDragOver] = useState(false);


    useEffect(() => {
        if (activeParticipant) {
            setFileInputs(activeParticipant.documents);
        }
    }, [activeParticipant, activeDocumentId]);

    const handleAddFileInput = () => {
        setShowModal(true);
    };

    const setFocus = () => {
        inputRef.current.focus()
    }

    const handleSaveFileName = () => {
        if (fileName) {
            const newDocument = {
                id: Date.now(),
                file: null,
                name: fileName,
                uploading: false,
                progress: 0,
                files: [], // Added to support multiple files under the same name
            };
            setFileInputs([
                ...fileInputs,
                newDocument,
            ]);
            dispatch(addDocument({ participantId: activeParticipant.id, documentName: newDocument.name, id: newDocument.id }));
            dispatch(setActiveDocument({ participantId: activeParticipant.id, documentId: newDocument.id }));
            setFileName("");
            setShowModal(false);
        } else {
            alert("File name cannot be empty!");
            setFocus();
        }
    };

    const handleFileChange = (rawFile) => {
        //const rawFile = e.target.files[0];
        if (rawFile) {
            const file = {
                name: rawFile.name,
                size: rawFile.size,
                type: rawFile.type,
            }
            dispatch(addFile({ participantId: activeParticipant.id, documentId: activeDocumentId, file: file, id: Date.now() }));
        }
    };

    return (
        <div className="file-uploader">
            {(activeParticipant) ? (
                <>
                    {/* Left Sidebar (Tabs) */}
                    <div className="file-tabs">
                        {fileInputs.map((input) => (
                            <div
                                key={input.id}
                                className={`file-tab ${activeDocumentId === input.id ? "selected" : ""}`}
                                onClick={() => dispatch(setActiveDocument({ participantId: activeParticipant.id, documentId: input.id }))}
                            >
                                {input.name || "Untitled"}
                            </div>
                        ))}
                        <button className="add-file-btn" onClick={handleAddFileInput}>
                            + Add File Name
                        </button>
                    </div>

                    {/* Right Side (File Details) */}
                    {fileInputs.length !== 0 && <div className="file-details">
                        <div className="row align-items-center "
                            onDragOver={(e) => e.preventDefault()} // Prevent default to allow drop
                            onDrop={(e) => {
                                e.preventDefault();
                                handleFileChange(e.dataTransfer.files[0]); // Handle file drop
                            }}
                        >
                            <div className="col-md-8 col-sm-12 ms-3 file-upload-container">
                                <label
                                    className="file-upload-label"
                                    htmlFor="file-input"
                                    onDragEnter={() => setDragOver(true)} // Visual feedback for drag
                                    onDragLeave={() => setDragOver(false)}
                                >
                                    <div className={`file-upload-content ${dragOver ? "drag-over" : ""}`}>
                                        <FontAwesomeIcon icon={faDownload} className="me-2 plus-icon" />
                                        <span className="choose-label">
                                            Select a file or drag it here
                                        </span>
                                    </div>
                                </label>
                                <input
                                    id="file-input"
                                    type="file"
                                    onChange={(e) => handleFileChange(e.target.files[0])}
                                    className="file-input"
                                />
                            </div>
                            <div className="col-md-3 col-sm-12 text-center mt-2 mt-md-0">
                                <button
                                    className="remove-input-btn"
                                    onClick={() =>
                                        dispatch(
                                            removeDocument({
                                                participantId: activeParticipant.id,
                                                documentId: activeDocumentId,
                                            })
                                        )
                                    }
                                >
                                    Cancel<FontAwesomeIcon icon={faTimes} className="ms-1" />
                                </button>
                            </div>
                        </div>

                        <FileDetails activeParticipant={activeParticipant} activeDocumentId={activeDocumentId} />
                    </div>}


                    {/* Modal for entering file name */}
                    {showModal && (
                        <div className="file-modal-overlay">
                            <div className="file-modal-content">
                                <h3>Add File Name</h3>
                                <button type="button" className="close-btn" onClick={() => setShowModal(false)}>
                                    <FontAwesomeIcon icon={faTimes} className="me-0" />
                                </button>
                                <input
                                    type="text"
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    placeholder="Enter file name"
                                    className="file-modal-input"
                                    ref={inputRef}
                                />
                                <div className="file-modal-buttons">
                                    <button onClick={handleSaveFileName} className="save-btn">
                                        Save
                                    </button>
                                    <button onClick={() => setShowModal(false)} className="cancel-btn">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p>Please select or add a participant to manage files.</p>
            )}
        </div>
    );
};

export default FileUploader;
