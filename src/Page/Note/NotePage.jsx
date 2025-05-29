import NotesCard from "../../components/Notes/NoteCard";
import AddRemarkModal from "../../components/Notes/AddRemarkModal";
import "./NotePage.scss";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

const NotePage = () => {
  const [remarkData, setRemarkData] = useState({
    "Person Remark": [
      { title: "Met with Jenis to discuss UX goals", date: "May 15, 2025", isFavorite: false, color: "#ffe08261" },
    ],
    "Special Remark": [
      { title: "UX Award Nominee : Jenis", date: "May 20, 2025", isFavorite: true, color: "#ffab9173" },
    ],
    "Family Remark": [
      { title: "Anna's school project presentation :Jenis", date: "May 25, 2025", isFavorite: false, color: "#b39ddb66" },
    ]
  });

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [text, setText] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setText("");
    setTabIndex(0);
    setEditMode(false);
  };

  const handleSave = () => {
    const tabNames = ["Person Remark", "Special Remark", "Family Remark"];
    const category = tabNames[tabIndex];
    const newCard = {
      title: text,
      date: new Date().toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
      }),
      isFavorite: false,
      color:
        tabIndex === 0 ? "#ffe082" :
          tabIndex === 1 ? "#ffab91" : "#b39ddb"
    };

    setRemarkData(prev => ({
      ...prev,
      [category]: [...prev[category], newCard]
    }));
    handleClose();
  };

  const handleEdit = (group, card) => {
    setEditData({ group, ...card });
    setOpen(true);
    setEditMode(true);
  };

  return (
    <div className="remark-groups">
      {Object.entries(remarkData).map(([group, cards]) => (
        <div key={group} className="remark-group">
          <h3>{group}</h3>
          <div className="remark-list">
            {cards.map((card, index) => (
              <NotesCard key={index} card={card} group={group} handleEdit={handleEdit} />
            ))}
          </div>
        </div>
      ))}

      {/* Floating Add Button */}
      <button className="add-remark-button" onClick={handleOpen}>
        <FaPlus />
      </button>

      {/* Add Remark Modal */}
      <AddRemarkModal
        open={open}
        onClose={handleClose}
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
        text={text}
        setText={setText}
        initialData={editData}
        editMode={editMode}
        onSave={handleSave}
      />
    </div>
  );
};

export default NotePage;
