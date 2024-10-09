import React, { useState, createContext, useEffect } from "react";
import { currentTime, getDateStructured } from "../../../utils/Utils";
import { folderList } from "./Data";
import axios from "axios";
import fetchDataList from "./dbdata";
import { useKeycloak } from "@react-keycloak/web";
import keycloak from "../../auth/keycloak";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import icons from "./icons";
import { Button } from "reactstrap";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

export const FileManagerContext = createContext();

export const FileManagerContextProvider = (props) => {
  const [data, setData] = useState(folderList);
  const [plan, setPlan] = useState("Starter");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { keycloak, initialized } = useKeycloak();
  const location = useLocation();
  const URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    console.log("location", location);

    if (initialized) {
      updateFolderList();
    }
  }, [initialized, location]);

  // Function to update folderList with new data
  async function updateFolderList() {
    try {
      // Fetch new data
      const newData = await fetchDataList({ token: keycloak.token });

      // Append new data to existing folderList
      setData([...folderList, ...newData]);

      // Use folderList as needed
      console.log("Updated Folder List:", folderList);
    } catch (err) {
      console.error("Error:", err);
    }
  }

  // Creates a new folder
  const createFolder = (filename, svg) => {
    let newFolder = {
      id: data.length + 1,
      meta: {
        type: "folder",
        name: filename,
        svg: svg,
        time: currentTime(),
        date: getDateStructured(new Date()),
        size: 0,
        starred: false,
      },
      subFolder: [],
    };
    let defaultData = data;
    let folderId =
      window.location.pathname.split("/")[
      window.location.pathname.split("/").length - 1
      ];
    let findFolder = defaultData.findIndex(
      (item) => item.id === Number(folderId)
    );
    if (folderId !== "" && defaultData[findFolder] !== undefined) {
      defaultData[findFolder].subFolder.push({ fileId: data.length + 1 });
      defaultData = [newFolder, ...defaultData];
      setData(defaultData);
    } else {
      setData([newFolder, ...defaultData]);
    }
  };

  // Creates a file
  const createFile = (files) => {
    let defaultData = data;
    let folderId =
      window.location.pathname.split("/")[
      window.location.pathname.split("/").length - 1
      ];
    let findFolder = defaultData.findIndex(
      (item) => item.id === Number(folderId)
    );
    if (folderId !== "" && defaultData[findFolder] !== undefined) {
      let fileArray = [];
      files.forEach((item) => {
        fileArray.push({ fileId: item.id });
      });
      defaultData[findFolder].subFolder = [
        ...defaultData[findFolder].subFolder,
        ...fileArray,
      ];
      defaultData = [...defaultData, ...files];
      setData([...defaultData]);
    } else {
      defaultData = [...defaultData, ...files];
      setData([...defaultData]);
    }
  };


  const displayFile = async (file) => {
    try {
      const response = await axios.get(`${URL}/${file.id}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
        responseType: "arraybuffer",
      });

      let extention = file.meta.name.split('.').pop().toLowerCase();
      let fileType = "default";
      let content = null;

      switch (extention) {
        case "png":
        case "jpg":
        case "jpeg":
        case "web":
        case "gif":
          fileType = `image/${extention}`;
          break;
        case "pdf":
          fileType = "application/pdf";
          break;
        default:
          // Instead of displaying, trigger the download for docx and xlsx files
          const blob = new Blob([response.data], { type: fileType });
          const fileURL = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = fileURL;
          link.setAttribute("download", file.meta.name);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          console.log('The type of the file can\'t be displayed');
          return;
      }

      const blob = new Blob([response.data], { type: fileType });
      const fileURL = window.URL.createObjectURL(blob);

      setSelectedFile({ ...file, fileURL, isImage: ['png', 'jpg', 'web', 'gif'].includes(extention), isPdf: extention === 'pdf' });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error displaying file:", error);
    }
  };




  // Function to close the pop-up
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };


  // Download a folder/file
  const downloadFile = async (file) => {
    try {
      const response = await axios.get(
        `${URL}/${file.id}`,
        {
          headers: { Authorization: `Bearer ${keycloak.token}` },
          responseType: "blob",
        }
      );
      console.log(keycloak.token);


      // Create a Blob from the response data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.meta.name); // Set the file name
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  // Downloads all the selected file
  const selectorDownloadFile = () => {
    let defaultData = data;
    let checkedItems = defaultData.filter((item) => item.meta.checked === true);
    checkedItems.forEach((file) => {
      downloadFile(file);
    });
  };

  // Copy a folder/file
  const copyToFolder = (file, folder) => {
    let defaultData = data;

    if (folder !== "") {
      let findNewFolderIndex = defaultData.findIndex(
        (item) => item.id === folder
      );

      defaultData[findNewFolderIndex].subFolder.push({ fileId: file.id });
      setData([...defaultData]);
    }
  };

  // Selector copy for lists
  const selectorCopyToFolder = (folder) => {
    let defaultData = data;
    let checkedItems = defaultData.filter((item) => item.meta.checked === true);
    checkedItems.forEach((file) => {
      copyToFolder(file, folder);
    });
  };

  // Move a folder/filer
  const moveFolder = (currentFolder, file, folder) => {
    let defaultData = data;
    if (folder !== "") {
      if (currentFolder === null) {
        copyToFolder(file, folder);
      } else {
        let findNewFolderIndex = defaultData.findIndex(
          (item) => item.id === folder
        );
        let findPrevFolderIndex = defaultData.findIndex(
          (item) => item.id === Number(currentFolder)
        );
        defaultData[findNewFolderIndex].subFolder.push({ fileId: file.id });
        defaultData[findPrevFolderIndex].subFolder = defaultData[
          findPrevFolderIndex
        ].subFolder.filter((item) => item.fileId !== file.id);
        setData([...defaultData]);
      }
    }
  };

  // Shares a file/folder
  const shareFiles = (id) => {
    let defaultData = data;
    let found = defaultData.findIndex((item) => item.id === id);
    defaultData[found].shared = {
      sharedTime: currentTime(),
      sharedDate: "Today",
    };
    defaultData[found].meta.members = [
      { user: "Illiash Hossain", theme: "purple" },
    ];
    setData([...defaultData]);
  };

  const onStarClick = (id) => {
    const starFile = async (id) => {
      const response = await axios.post(
        "http://localhost:4000/api/starFile",
        { id },
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      );
      console.log(response.data);

      let dataList = response.data
        .filter((meta) => !meta.metadata.recovery) // Exclude files in recovery
        .map((meta, index) => {
          const extension = meta.metadata.originalname
            .split(".")
            .pop()
            .toLowerCase();

          return {
            id: meta._id || index, // Use meta._id if available
            meta: {
              type: "file",
              name: meta.metadata.originalname || "Unknown",
              checked: false,
              svg: icons[extension] || icons["default"], // Select SVG based on file extension
              time: new Date(meta.uploadDate).toLocaleTimeString(),
              date: new Date(meta.uploadDate).toLocaleDateString(),
              size: (meta.length / 1024 / 1024).toFixed(2), // Convert size to MB
              starred: meta.metadata.starred,
              share: false,
            },
            subFolder: [],
          };
        });

      console.log("datalist", dataList);

      setData(dataList);
    };

    starFile(id);
  };


  // Checks a file/folder
  const onFileCheck = (ev, id) => {
    let defaultData = data;
    let found = defaultData.findIndex((item) => item.id === id);
    if (ev.target.checked) {
      defaultData[found].meta.checked = true;
      setData([...defaultData]);
    } else {
      defaultData[found].meta.checked = false;
      setData([...defaultData]);
    }
  };

  const deleteFolder = async (id) => {
    try {
      // Send a PATCH request to the backend API to mark the folder/file as in recovery
      await axios.patch(`${URL}/recovery/${id}`, { recovery: true }, { headers: { Authorization: `Bearer ${keycloak.token}` } });
      // If the DELETE request is successful, update the local state
      let defaultData = data;
      let found = defaultData.findIndex((item) => item.id === id);
      if (found !== -1) {
        defaultData[found]["recovery"] = { deletedAt: "Today", deletedOn: currentTime() };
        setData([...defaultData]);
      }

      // Update the local state...
    } catch (error) {
      console.error('Error marking folder/file as recovered:', error.response ? error.response.data : error.message);
    }
  };




  // Deletes all the selected file
  const selectorDeleteFolder = () => {
    let defaultData = data;
    let checkedItems = defaultData.filter((item) => item.meta.checked === true);
    checkedItems.forEach((file) => {
      deleteFolder(file.id);
    });
  };

  // Restores a file
  const restoreFolder = async (id) => {
    try {
      // Send a PATCH request to the backend API to mark the folder/file as in recovery
      await axios.patch(`${URL}/recovery/${id}`, { recovery: false }, { headers: { Authorization: `Bearer ${keycloak.token}` } });
      // If the DELETE request is successful, update the local state
      let defaultData = data;
      let found = defaultData.findIndex((item) => item.id === id);
      if (found !== -1) {
        defaultData[found]["recovery"] = { deletedAt: "Today", deletedOn: currentTime() };
        setData([...defaultData]);
      }

      // Update the local state...
    } catch (error) {
      console.error('Error marking folder/file as recovered:', error.response ? error.response.data : error.message);
    }
  };

  // Removes shares
  const removeShare = (id, type) => {
    let defaultData = data;
    let found = defaultData.findIndex((item) => item.id === id);
    if (type === "incoming") {
      defaultData[found].meta.members = [];
      setData([...defaultData]);
    } else if (type === "outgoing") {
      defaultData[found].shared = false;
      setData([...defaultData]);
    } else {
      defaultData[found].meta.link = false;
      setData([...defaultData]);
    }
  };

  // Permanently deletes folders/files
  const permanentDelete = async (id) => {
    try {
      // Send a DELETE request to the backend API to delete the folder/file
      await axios.delete(`${URL}/${id}`, { headers: { Authorization: `Bearer ${keycloak.token}` } });


      // If the DELETE request is successful, update the local state
      let defaultData = data;
      let found = defaultData.findIndex((item) => item.id === id);

      if (found !== -1) {
        defaultData[found]["recovery"] = { deletedAt: "Today", deletedOn: currentTime() };
        setData([...defaultData]);
      }

      console.log('Folder/File deleted successfully.');
    } catch (error) {
      console.error('Error deleting folder/file:', error.response ? error.response.data : error.message);
    }
  };

  // Returns the total size for a folder;
  const getTotalSize = (folder) => {
    let folderChildren = folder.subFolder;
    let size = 0;
    if (folderChildren.length === 0) {
      return size;
    } else {
      folderChildren.forEach((el) => {
        let file = getFiles(el.fileId);
        if (file === undefined) {
          size = size + 0;
        } else {
          size = size + file.meta.size;
        }
      });
      return size;
    }
  };

  const getFiles = (id) => {
    return data.find((item) => item.id === id);
  };

  return (
    <FileManagerContext.Provider
      value={{
        contextData: [data, setData],
        planData: [plan, setPlan],
        createFolder: createFolder,
        createFile: createFile,
        onStarClick: onStarClick,
        deleteFolder: deleteFolder,
        selectorDeleteFolder: selectorDeleteFolder,
        restoreFolder: restoreFolder,
        removeShare: removeShare,
        shareFiles: shareFiles,
        onFileCheck: onFileCheck,
        downloadFile: downloadFile,
        selectorDownloadFile: selectorDownloadFile,
        copyToFolder: copyToFolder,
        selectorCopyToFolder: selectorCopyToFolder,
        moveFolder: moveFolder,
        permanentDelete: permanentDelete,
        getTotalSize: getTotalSize,
        displayFile: displayFile,

      }}
    >
      {props.children}
      {isModalOpen && (
        <>
          <div style={modalOverlayStyles}></div>
          <div style={modalStyles}>
            {selectedFile && (
              <div>
                <div className="d-flex justify-content-between align-items-center">
                  <h2>{selectedFile.meta.name}</h2>
                  <Button className="btn btn-danger" onClick={closeModal}>X</Button>
                </div>
                {selectedFile.isImage ? (
                  <img
                    src={selectedFile.fileURL}
                    alt={selectedFile.meta.name}
                    style={{ width: "100%", height: "auto", maxHeight: "500px", objectFit: "contain" }}
                  />
                ) : selectedFile.isPdf ? (
                  <iframe
                    src={selectedFile.fileURL}
                    title="PDF file"
                    style={{ width: "100%", height: "500px" }}
                  ></iframe>
                ) : (
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedFile.content }}
                    style={{ width: "100%", height: "500px", overflowY: "auto" }}
                  />
                )}
              </div>
            )}
          </div>
        </>
      )}

    </FileManagerContext.Provider>
  );
};
// Styles for the custom pop-up
const modalOverlayStyles = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: 1000,
};

const modalStyles = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#fff",
  padding: "20px",
  zIndex: 1001,
  borderRadius: "8px",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
  width: "80%",
  maxHeight: "90%",
  overflowY: "auto",
};