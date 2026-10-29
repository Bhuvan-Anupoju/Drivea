import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { useDrive } from "../../hooks/useDrive";
import { Button } from "../ui/Button";

const CreateFolderModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { createFolder } = useDrive();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    await createFolder(name.trim());
    setIsLoading(false);
    setName("");
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={"New Folder"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Folder Name"
          placeholder="Until Folder"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="ghost"
            type="submit"
            disabled={!name.trim()}
            isLoading={isLoading}
          >
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateFolderModal;
