import  { db } from "@/firebase/config";
import * as fs from "firebase/firestore";

const channelRef = fs.collection(db, "Channels");

export interface ChannelBrief {
    id: string;
    name: string;
    description: string;
}
export interface Channel extends ChannelBrief {
    socialMedia: {
        facebook: string;
        instagram: string;
    }
}

const getChannelBriefs = async (channels: string[]) => {
    console.log(channels);
    const channelsQuery = fs.query(channelRef, fs.where( fs.documentId() , 'in', channels));
    console.log(channelsQuery);
    const snapshot = await fs.getDocs(channelsQuery);
    console.log(snapshot.docs);
    const channelBriefs = snapshot.docs.map((doc) => {
        return {
            id: doc.id,
            name: doc.data().name,
            description: doc.data().description,
        } as ChannelBrief;
    });
    return channelBriefs;
};

const getChannel = async (channelId: string) => {
    const snapshot = await fs.getDoc(fs.doc(channelRef, channelId));
    return snapshot.data();
};

const createChannel = async (channel: Channel , userId: string) => {
    const {id , ...channelWithoutId} = channel;
    const newChannel = await fs.addDoc(fs.collection(db, "Channels"), channelWithoutId);
    await fs.updateDoc(fs.doc(db, "Users", userId), {
        channels: fs.arrayUnion(newChannel.id),
    });
};

    
export { getChannelBriefs, getChannel, createChannel };
