import "./AttachmentGallery.css";

import {
    Download,
    FileText,
    Image as ImageIcon,
    Eye
} from "lucide-react";

const AttachmentGallery = ({ attachments = [] }) => {

    if (!attachments.length) return null;

    const isImage = (file) => {

        if (file.fileType?.startsWith("image")) return true;

        const url = file.url.toLowerCase();

        return (
            url.endsWith(".png") ||
            url.endsWith(".jpg") ||
            url.endsWith(".jpeg") ||
            url.endsWith(".webp")
        );

    };

    return (

        <div className="attachment-gallery-card">

            <div className="attachment-gallery-header">

                <h3>

                    Attachments

                </h3>

                <span>

                    {attachments.length} File{attachments.length > 1 ? "s" : ""}

                </span>

            </div>

            <div className="attachment-gallery-grid">

                {

                    attachments.map((file, index) => (

                        <div
                            key={index}
                            className="attachment-gallery-item"
                        >

                            {

                                isImage(file)

                                    ?

                                    <div className="attachment-image-wrapper">

                                        <img
                                            src={file.url}
                                            alt={file.fileName}
                                            className="attachment-preview-image"
                                        />

                                        <div className="attachment-overlay">

                                            <a
                                                href={file.url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >

                                                <Eye size={20} />

                                            </a>

                                        </div>

                                    </div>

                                    :

                                    <div className="attachment-document">

                                        <FileText size={52} />

                                    </div>

                            }

                            <div className="attachment-gallery-footer">

                                <div className="attachment-file-info">

                                    {

                                        isImage(file)

                                            ?

                                            <ImageIcon size={16} />

                                            :

                                            <FileText size={16} />

                                    }

                                    <span>

                                        {file.fileName}

                                    </span>

                                </div>

                                <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="attachment-download-btn"
                                >

                                    <Download size={18} />

                                </a>

                            </div>

                        </div>

                    ))

                }

            </div>

        </div>

    );

};

export default AttachmentGallery;