import React, { useEffect, useState } from "react";
import Breadcrumbs from "../components/layout/Breadcrumbs";
import FileGrid from "../components/files/FileGrid";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/appContext";
import { useDrive } from "../hooks/useDrive";

const Drive = () => {
  const navigate = useNavigate();
  const { folderId } = useParams();
  const { fetchDriveContent, setCurrentFolderId } = useApp();
  const { deleteItem: removeDriveItem } = useDrive();

  useEffect(() => {
    const id = folderId || null;
    setCurrentFolderId(id);
    fetchDriveContent(id);
  }, [folderId, fetchDriveContent, setCurrentFolderId]);

  // Active item modals
  const [previewFile, setPreviewFile] = useState(null);
  const [shareItem, setShareItem] = useState(null);
  const [renameItem, setRenameItem] = useState(null);
  const [moveItem, setMoveItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <Breadcrumbs />
      {/* folder & files */}
      <FileGrid
        onFolderClick={(folder) => navigate(`/drive/${folder.id}`)}
        onPreviewFile={setPreviewFile}
        onShareItem={setShareItem}
        onRenameItem={setRenameItem}
        onMoveItem={setMoveItem}
        onDeleteItem={setDeleteItem}
      />
    </div>
  );
};

export default Drive;
