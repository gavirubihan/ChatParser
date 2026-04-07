import { saveSession, saveMessages, saveMedia } from './storage';
import type { ChatSession } from './storage';
import type { ChatMessage } from './chatParser';

const SESSION_ID = 'sample-session';

export async function createSampleChat(): Promise<string> {
  // 1. Create the session
  const session: ChatSession = {
    id: SESSION_ID,
    name: 'Summer Trip 🏖️',
    participants: ['John', 'Sarah', 'Mike'],
    messageCount: 8,
    isGroup: true,
    startDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
    endDate: new Date(),
    createdAt: new Date(),
    size: 1024 * 1024 * 2.5, // 2.5MB estimate
  };

  await saveSession(session);

  // 2. Prepare Media Blobs
  
  // --- Sample Image ---
  const imageUrl = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
  const imageBlob = await fetch(imageUrl).then(r => r.blob());
  const imageKey = await saveMedia(SESSION_ID, 'beach-sunset.jpg', imageBlob, 'image/jpeg');

  // --- Sample Voice Note (Silent MP3) ---
  const audioBlob = new Blob([new Uint8Array(1000)], { type: 'audio/mpeg' });
  const audioKey = await saveMedia(SESSION_ID, 'voice-note.mp3', audioBlob, 'audio/mpeg');

  // --- Sample Document ---
  const docContent = `Summer Trip Itinerary 🏖️
  
  1. Flight: BA123 at 10:00 AM
  2. Hotel: Blue Ocean Resort
  3. Activities: Surfing, BBQ, Snorkeling
  
  Don't forget your sunscreen!`;
  const docBlob = new Blob([docContent], { type: 'text/plain' });
  const docKey = await saveMedia(SESSION_ID, 'itinerary.txt', docBlob, 'text/plain');

  // 3. Create Messages
  const now = Date.now();
  const messages: ChatMessage[] = [
    {
      id: `${SESSION_ID}-1`,
      sessionId: SESSION_ID,
      timestamp: new Date(now - 3600000 * 5),
      sender: 'System',
      content: 'John created the group "Summer Trip 🏖️"',
      type: 'system'
    },
    {
      id: `${SESSION_ID}-2`,
      sessionId: SESSION_ID,
      timestamp: new Date(now - 3600000 * 4),
      sender: 'John',
      content: 'Hey guys! Are we still on for the beach trip this weekend?',
      type: 'text'
    },
    {
      id: `${SESSION_ID}-3`,
      sessionId: SESSION_ID,
      timestamp: new Date(now - 3600000 * 3.5),
      sender: 'Sarah',
      content: 'Totally! I already packed my sunscreen 🧴',
      type: 'text'
    },
    {
      id: `${SESSION_ID}-4`,
      sessionId: SESSION_ID,
      timestamp: new Date(now - 3600000 * 3),
      sender: 'Mike',
      content: 'Check out the view from the hotel I just booked!',
      type: 'text'
    },
    {
      id: `${SESSION_ID}-5`,
      sessionId: SESSION_ID,
      timestamp: new Date(now - 3600000 * 2.9),
      sender: 'Mike',
      content: 'beach-sunset.jpg',
      type: 'image',
      fileName: 'beach-sunset.jpg',
      mediaKey: imageKey
    },
    {
      id: `${SESSION_ID}-6`,
      sessionId: SESSION_ID,
      timestamp: new Date(now - 3600000 * 2.5),
      sender: 'Sarah',
      content: 'voice-note.mp3',
      type: 'audio',
      fileName: 'voice-note.mp3',
      mediaKey: audioKey
    },
    {
      id: `${SESSION_ID}-7`,
      sessionId: SESSION_ID,
      timestamp: new Date(now - 3600000 * 2),
      sender: 'Mike',
      content: 'Here is the full itinerary for the trip.',
      type: 'text'
    },
    {
      id: `${SESSION_ID}-8`,
      sessionId: SESSION_ID,
      timestamp: new Date(now - 3600000 * 1.9),
      sender: 'Mike',
      content: 'itinerary.txt',
      type: 'document',
      fileName: 'itinerary.txt',
      mediaKey: docKey
    },
    {
      id: `${SESSION_ID}-9`,
      sessionId: SESSION_ID,
      timestamp: new Date(now - 3600000 * 1),
      sender: 'John',
      content: 'you deleted this message',
      type: 'deleted'
    }
  ];

  await saveMessages(messages);
  
  return SESSION_ID;
}
