"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  doc,
  getDocs,
  updateDoc,
  collection,
  Timestamp,
  where,
  query,
} from "firebase/firestore";
import { db } from "../Firebase/firebase.config";
import { useSelector } from "react-redux";
import Loading from "../loading";

const DBoard = () => {
  const user = useSelector((state) => state.user.userState);
  const [loading, setLoading] = useState(true);
  const [newcardAdded, setNewcardAdded] = useState(false);
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({ title: "", description: "" });
  useEffect(() => {
    if (user) {
      if (!user.isLoggedIn) {
        router.replace("/");
      } else {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchCards = async () => {
      if (user?.isLoggedIn) {
        try {
          const projectsRef = collection(db, "project");
          const q = query(projectsRef, where("email", "==", user.email));
          const querySnapshot = await getDocs(q);
          const fetchedCards = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCards(fetchedCards);
        } catch (error) {
          console.error("Error fetching cards:", error);
        }
      }
    };

    fetchCards();
  }, [user.isLoggedIn, user.email, newcardAdded]);

  const handleAddCard = async () => {
    if (newCard.title && newCard.description) {
      setIsModalOpen(false);
      const time = Timestamp.now();
      const title = newCard.title;
      const project = await addDoc(collection(db, "project"), {
        email: user.email,
        title,
        description: newCard.description,
        time,
      });
      await updateDoc(doc(db, "user", user.userId), {
        projects: [...user.projects, project.id],
      });
      setNewcardAdded(!newcardAdded);
      setNewCard({ title: "", description: "" });
    }
  };

  const handleCardClick = (title) => {
    router.push(`/dashboard/${title}`);
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="h-screen bg-gradient-to-b from-[#212121] to-black text-white px-[70px] selection:bg-[#111]">
      <div className="flex justify-between h-[10vh] items-center">
        <h1 className="font-Jersey text-4xl select-none">Post Pilot</h1>
      </div>

      <div className="pt-8 grid grid-cols-4 h-[90vh] justify-items-center gap-10 py-8 px-[50px] overflow-y-auto">
        <div
          onClick={() => setIsModalOpen(true)}
          className="group p-6 w-[200px] h-[200px] bg-gray-800/50 backdrop-blur-sm rounded-xl cursor-pointer hover:bg-gray-700/70 transition-all duration-300 flex items-center justify-center border border-dashed border-gray-700/30 hover:border-blue-500 shadow-xl hover:shadow-2xl hover:-translate-y-1"
        >
          <span className="text-5xl font-bold text-gray-500 group-hover:text-blue-400 transition-colors">
            +
          </span>
        </div>
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(card.id)}
            className="group p-6 w-[200px] h-[200px] bg-gray-800/50 backdrop-blur-sm rounded-xl cursor-pointer hover:bg-gray-700/70 transition-all duration-300 flex flex-col items-center justify-center border border-gray-700/30 hover:border-gray-600 shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
              {card.title}
            </h2>
            <p className="text-center text-gray-400 group-hover:text-gray-300">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900/90 p-8 rounded-xl shadow-2xl w-[450px] border border-gray-800">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text">
              Add New Card
            </h2>
            <input
              type="text"
              placeholder="Card Title"
              value={newCard.title}
              onChange={(e) =>
                setNewCard({ ...newCard, title: e.target.value })
              }
              className="w-full p-3 mb-4 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-700/30"
            />
            <textarea
              placeholder="Card Description"
              value={newCard.description}
              onChange={(e) =>
                setNewCard({ ...newCard, description: e.target.value })
              }
              className="w-full p-3 mb-6 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-700/30 min-h-[120px] resize-none"
              rows="4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-gray-700/50 rounded-lg hover:bg-gray-600 transition-all duration-300 text-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCard}
                className="px-5 py-2.5 bg-blue-600/90 rounded-lg hover:bg-blue-700 transition-all duration-300 text-white font-semibold shadow-lg shadow-blue-600/20"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DBoard;
