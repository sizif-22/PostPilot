import  { db } from "@/firebase/config";
import * as fs from "firebase/firestore";
import { Authority , UserChannel } from "./user.firestore";
const channelRef = fs.collection(db, "Channels");

export interface ChannelBrief {
    id: string;
    name: string;
    description: string;
    authority: Authority;
    createdAt: fs.Timestamp;    
}
export interface Channel extends ChannelBrief {
    socialMedia: {
        facebook: string;
        instagram: string;
    }
}

const getChannelBriefs = async (channels: UserChannel[]) => {
    if(channels.length === 0) return [];
    const idList = channels.map((channel) => channel.id);
    const channelsQuery = fs.query(channelRef, fs.where( fs.documentId() , 'in', idList));
    const snapshot = await fs.getDocs(channelsQuery);
    const channelBriefs = snapshot.docs.map((doc) => {
        return {
            id: doc.id,
            name: doc.data().name,
            description: doc.data().description,
            authority: channels.find((channel) => channel.id === doc.id)?.authority || "Instructor",
            createdAt: doc.data().createdAt,
        } as ChannelBrief;
    });
    return channelBriefs;
};

const getChannel = (channel: UserChannel , callback: (channel: Channel | null) => void):fs.Unsubscribe => {
    const channelRef = fs.doc(db , "Channels" , channel.id);
    return fs.onSnapshot(channelRef, (doc) => {
        if(doc.exists()) {
            callback({...doc.data(), id: doc.id, authority: channel.authority} as Channel);
        } else {
            callback(null);
        }
    });
};

const createChannel = async (channel: Channel , userId: string) => {
    const {id , authority , ...channelWithoutIdAndAuthority} = channel;
    const newChannel = await fs.addDoc(fs.collection(db, "Channels"), channelWithoutIdAndAuthority);
    await fs.updateDoc(fs.doc(db, "Users", userId), {
        channels: fs.arrayUnion({id: newChannel.id, authority: "Owner"}),
    });
};    
export { getChannelBriefs, getChannel, createChannel };