import keycloak from "../../auth/keycloak";
import icons from "./icons";

const URL = process.env.REACT_APP_API_URL;
// Initialize the dataList array
var dataList = [];

// Function to fetch and return the dataList
async function fetchDataList({ token }) {
    try {
        const response = await fetch(URL, { headers: { "Authorization": `Bearer ${token}` } });
        const data = await response.json();
        const fileIds = data.fileIds;

        // Fetch metadata for each file
        const metadataPromises = fileIds.map(id =>
            fetch(`${URL}/metadata/${id}`, { headers: { "Authorization": `Bearer ${token}` } })
                .then(response => response.json())
        );
        const metadataList = await Promise.all(metadataPromises);

        // Filter out files that are in recovery mode
        const filteredMetadataList = metadataList.filter(meta => meta.metadata.recovery === false);

      // Transform metadata into the desired format
      dataList = filteredMetadataList.map((meta, index) => {
          // Extract file extension
          // console.log("METADATA : ",meta.metadata)
          const extension = meta.filename?.split('.').pop().toLowerCase();

          let fileType = extension;
          if (['xls', 'xlsx', 'xlsm', 'xlsb'].includes(extension)) {
              fileType = `Microsoft Excel (.${extension})`;
          }
          if (['doc', 'docx'].includes(extension)) {
              fileType = `Microsoft Word (.${extension})`;
          }
          if (['ppt', 'pptx'].includes(extension)) {
              fileType = `Microsoft PowerPoint (.${extension})`;
      }

          if (['pdf'].includes(extension)) {
              fileType = `Microsoft Edge PDF Document (.${extension})`;
          }

          if (['png','jpeg','jpg'].includes(extension)) {
              fileType = `Fichier ${extension.toLocaleUpperCase()} (.${extension})`;
          }


          return {
              id: meta._id || index, // Use meta._id if available
              meta: {
                  type: "file",
                  name: meta.filename || "Unknown",
                  checked: false,
                  svg: icons[extension] || icons['default'], // Select SVG based on file extension
                  time: new Date(meta.uploadDate).toLocaleTimeString(),
                  date: new Date(meta.uploadDate).toLocaleDateString(),
                  size: (meta.length / 1024 / 1024).toFixed(2), // Convert size to MB
                  starred: meta.metadata.starred,
                  recovery:meta.metadata.recovery,
                  share: false,
              },
              subFolder: [] // Assuming no subfolders
          };
      });

      // Log the transformed dataList
      console.log('Transformed Data List:', dataList);
      return dataList;
  } catch (err) {
      console.error('Error fetching data:', err);
      return []; // Return an empty array on error
  }
}

export default fetchDataList;
