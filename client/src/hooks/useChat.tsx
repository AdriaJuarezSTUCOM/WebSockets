import axios from 'axios';

export default function useChat(setRooms:any) {
  async function GetUserRooms(userId: string) {
    try {
      const response = await axios.get(`http://localhost:4000/api/getRooms?userId=${userId}`);

      console.log("DATA", response.data);

      if (response.data.success) {
        console.log("Usuario encontrado:", response.data.rooms);
        setRooms(response.data.rooms);
      } else {
        console.log("Error:", response.data.error);
      }
    } catch (error) {
      console.error("Error al hacer login:", error);
    }
  }

  return GetUserRooms;
}
