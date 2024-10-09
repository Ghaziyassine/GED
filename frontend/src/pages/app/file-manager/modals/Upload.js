import React, {useContext, useState} from "react";
import Dropzone from "react-dropzone";
import {Alert, Button} from "reactstrap";
import {Icon} from "../../../../components/Component";
import {svgSelect} from "../Data";
import {FileManagerContext} from "../FileManagerContext";
import {
    bytesToMegaBytes,
    currentTime,
    getDateStructured,
} from "../../../../utils/Utils";
import axios from "axios";
import {useKeycloak} from "@react-keycloak/web";
import {useHistory} from 'react-router-dom';


const Upload = ({toggle}) => {

    const {createFile} = useContext(FileManagerContext);
    const {keycloak} = useKeycloak()

    const [files, setFiles] = useState([]);
    const [buttonDisabled, setIsButtonDisabled] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const history = useHistory()

    const handleDropChange = (uploadedfile) => {
        setFiles((prevFlies) => [...prevFlies, ...uploadedfile]);
        setIsButtonDisabled(false);
    };

    const addFilesToSystem = async () => {
        try {
            const uploadOwner = keycloak.tokenParsed.name
            const newFiles = [];
            const formData = new FormData();

            files.forEach((file) => {
                let newFile = {
                    id: Math.random(),
                    meta: {
                        type: file.type,
                        name: file.name,
                        svg: svgSelect[file.type]
                            ? svgSelect[file.type]
                            : svgSelect["others"],
                        time: currentTime(),
                        date: getDateStructured(new Date()),
                        size: bytesToMegaBytes(file.size),
                        starred: false,
                    },
                };

                console.log("name  of the file uploaded", newFile.meta.name);
                console.log("owner is : ",uploadOwner)

                newFiles.push(newFile);
                formData.append("file", file);
            });

            formData.append("uploadOwner", uploadOwner);


            console.log("array's length:", newFiles.length);

            const response = await axios.post(
                `http://localhost:4000/api/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${keycloak.token}`
                    },
                }
            );
            setTimeout(() => {
                setSuccess(false);
                toggle();
                history.push("/demo8/app-file-manager")

            }, 2000);
            setSuccess(true);
        } catch (error) {
            setTimeout(() => {
                setError(false);
                toggle();
            }, 2000);
            setError(true);
        }
    };

    const removeFromList = (name) => {
        let defaultFiles = files;
        defaultFiles = defaultFiles.filter((item) => item.name !== name);
        setFiles([...defaultFiles]);
    };

    return (
        <React.Fragment>
            {success && (
                <Alert
                    className="alert-icon alert-icon alert alert-success fade show"
                    role="alert"
                    style={{position: "absolute", top: "-100px", width: "100%"}}
                >
                    <Icon name="alert-circle"/>
                    <strong>File uploaded succesfully</strong>
                </Alert>
            )}
            {error && (
                <Alert
                    className="alert-icon alert alert-danger fade show"
                    role="alert"
                    style={{position: "absolute", top: "-100px", width: "100%"}}
                >
                    <Icon name="alert-circle"/>
                    <strong>Server error, please try again</strong>
                </Alert>
            )}
            <a
                href="#close"
                onClick={(ev) => {
                    ev.preventDefault();
                    toggle();
                }}
                className="close"
            >
                <Icon name="cross-sm"></Icon>
            </a>
            <div className="modal-body modal-body-md">
                <div className="nk-upload-form">
                    <h5 className="title mb-3">Upload File</h5>
                    <Dropzone onDrop={(uploadedfile) => handleDropChange(uploadedfile)}>
                        {({getRootProps, getInputProps}) => (
                            <section>
                                <div
                                    {...getRootProps()}
                                    className="dropzone upload-zone small bg-lighter my-2 dz-clickable"
                                >
                                    <input {...getInputProps()} />
                                    <div className="dz-message">
                    <span className="dz-message-text">
                      <span>Drag and drop</span> file here or{" "}
                        <span>browse</span>
                    </span>
                                    </div>
                                </div>
                            </section>
                        )}
                    </Dropzone>
                </div>
                <div className="nk-upload-list">
                    <h6 className="title">Uploaded Files</h6>
                    {files.length > 0 ? (
                        files.map((file, index) => (
                            <div className="nk-upload-item" key={index}>
                                <div className="nk-upload-icon">
                                    {svgSelect[file.type]
                                        ? svgSelect[file.type]
                                        : svgSelect["others"]}
                                </div>
                                <div className="nk-upload-info">
                                    <div className="nk-upload-title">
                                        <span className="title">{file.name}</span>
                                    </div>
                                    <div className="nk-upload-size">
                                        {bytesToMegaBytes(file.size)} MB
                                    </div>
                                </div>
                                <div className="nk-upload-action">
                                    <a
                                        href="#delete"
                                        onClick={(ev) => {
                                            ev.preventDefault();
                                            removeFromList(file.name);
                                        }}
                                        className="btn btn-icon btn-trigger"
                                    >
                                        <Icon name="trash"></Icon>
                                    </a>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="d-flex justify-center">
                            <span>No files added yet !</span>
                        </div>
                    )}
                </div>
                <div className="nk-modal-action justify-end">
                    <ul className="btn-toolbar g-4 align-center">
                        <li>
                            <a
                                href="#toggle"
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    toggle();
                                }}
                                className="link link-primary"
                            >
                                Cancel
                            </a>
                        </li>
                        <li>
                            <Button
                                color="primary"
                                onClick={() => addFilesToSystem()}
                                disabled={buttonDisabled}
                            >
                                Add Files
                            </Button>
                        </li>
                    </ul>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Upload;
