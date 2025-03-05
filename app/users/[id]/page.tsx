// your code here for S2 to display a single user profile after having clicked on it
// each user has their own slug /[id] (/1, /2, /3, ...) and is displayed using this file
// try to leverage the component library from antd by utilizing "Card" to display the individual user
// import { Card } from "antd"; // similar to /app/users/page.tsx
"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React, { useEffect, useState } from "react"; //useEffect for side effects like fetching data, useState used to manage states
import { useRouter, useParams } from "next/navigation"; // useParams gets parameter from URL
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card } from "antd";

const UserProfile: React.FC = () => { //defines userprofile component
    const router = useRouter();
    const apiService = useApi();
    const {id} = useParams(); // stores the id
    const [user, setUser] = useState<User | null>(null); // stores the fetched data of user
    const [ownProfile, setOwnProfile] = useState<boolean>(false); // stores  if it's the user's own profile

    const {
        value: token,
        // set: setToken,
        //clear: clearToken,
    } = useLocalStorage<string>("token", "");


    useEffect(() => { //called when first rendered or when apiService changes
        if (!token) { // needed as at first token is empty and the UseEffect is executed directly and afterwards the token is fetched from local Storage
            console.log("Token is not available yet.");
            return;}

        const fetchUser = async () => { //makes a Get request to ID which then gets a response in form of a IDGetDTO
            try {
                // apiService.get<User> returns the parsed JSON object directly,
                // thus we can simply assign it to our users variable.
                console.log(token);
                const user: User = await apiService.get<User>(`/users/${id}`, {
                    "Authorization": `Bearer ${token}` , // passing token in header to check authentication in backend
                });
                console.log(user);
                setUser(user); //state change of state variable so React knows
                const loggedinUser : User = await apiService.get<User>('/me', { // get request to find logged in user
                    "Authorization": `Bearer ${token}` ,
                });
                setOwnProfile((loggedinUser.id == user.id));
                console.log("Fetched user:", user);
            } catch (error) {
                if (error instanceof Error) {
                    alert(`Something went wrong while fetching user:\n${error.message}`);
                } else {
                    console.error("An unknown error occurred while fetching user.");
                }
            }
        };

        fetchUser();
    }, [apiService, token, id]); // to ensure UseEffect reruns once token is fetched

    return (
        <div className="card-container">
            <Card
                title="User Profile"
                loading={!user} // is true when users is null
                className="dashboard-container"
            >
                {user && ( // renders when user has been fetched (not null anymore) (conditional rendering)
                    <>
                        <p><strong>Username:</strong> {user.username}</p>
                        <p><strong>Status:</strong> {user.status}</p>
                        <p><strong>Birthday:</strong> {user.birthday}</p>
                        <p><strong>Creation Date:</strong> {user.creationDate}</p>
                        { ownProfile && ( // renders if own profile
                        <Button
                            onClick = {() => router.push(`/users/${id}/edit`)}>
                            Edit
                        </Button>
                        )}
                        <Button
                            onClick = {() => router.push("/users/dashboard")}>
                            Dashboard
                        </Button>
                    </>
                )}
            </Card>
        </div>
    );
};
export default UserProfile