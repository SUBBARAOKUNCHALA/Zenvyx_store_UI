import "./AttachmentUploader.css";
import {
    Upload,
    X,
    FileText,
    Image as ImageIcon
} from "lucide-react";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const AttachmentUploader = ({ attachments, setAttachments }) => {

    const handleFiles = (files) => {

        const selectedFiles = Array.from(files);

        if (attachments.length + selectedFiles.length > MAX_FILES) {
            //alert(`Maximum ${MAX_FILES} files allowed.`);
            return;
        }

        const validFiles = [];

        selectedFiles.forEach(file => {

            if (file.size > MAX_FILE_SIZE) {
                //alert(`${file.name} exceeds 5MB.`);
                return;
            }

            validFiles.push(file);

        });

        setAttachments(prev => [...prev, ...validFiles]);

    };

    const removeFile = (index) => {

        const updated = [...attachments];

        updated.splice(index, 1);

        setAttachments(updated);

    };

    return (

        <div className="attachment-section">

            <label className="attachment-title">

                Upload Attachments

            </label>

            <label className="upload-box">

                <Upload
                    className="upload-icon"
                    size={42}
                />

                <h3>

                    Drag & Drop files here

                </h3>

                <p>

                    or click to browse from your computer

                </p>

                <span>

                    PNG • JPG • JPEG • WEBP • PDF

                </span>

                <small>

                    Maximum 5 files (5MB each)

                </small>

                <input
                    type="file"
                    multiple
                    hidden
                    accept=".png,.jpg,.jpeg,.webp,.pdf"
                    onChange={(e) => handleFiles(e.target.files)}
                />

            </label>

            {

                attachments.length > 0 && (

                    <div className="attachment-list">

                        {

                            attachments.map((file, index) => (

                                <div
                                    key={index}
                                    className="attachment-card"
                                >

                                    <div className="attachment-info">

                                        {

                                            file.type.startsWith("image")

                                                ?

                                                <ImageIcon
                                                    size={22}
                                                    className="attachment-file-icon image"
                                                />

                                                :

                                                <FileText
                                                    size={22}
                                                    className="attachment-file-icon pdf"
                                                />

                                        }

                                        <div>

                                            <h5>

                                                {file.name}

                                            </h5>

                                            <p>

                                                {(file.size / 1024).toFixed(1)} KB

                                            </p>

                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        className="remove-file-btn"
                                        onClick={() => removeFile(index)}
                                    >

                                        <X size={18} />

                                    </button>

                                </div>

                            ))

                        }

                    </div>

                )

            }

        </div>

    );

};

export default AttachmentUploader;