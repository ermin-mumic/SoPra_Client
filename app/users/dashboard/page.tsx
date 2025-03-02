// this code is part of S2 to display a list of all registered users
// clicking on a user in this list will display /app/users/[id]/page.tsx
"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React, { useEffect, useState } from "react"; //useEffect for side effects like fetching data, useState used to manage states
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Table } from "antd";
import type { TableProps } from "antd";
// Optionally, you can import a CSS module or file for additional styling:
// import "@/styles/views/Dashboard.scss";

// Columns for the antd table of User objects
const columns: TableProps<User>["columns"] = [
  {
    title: "Username", //header text
    dataIndex: "username", //key that corresponds to the property in the data --> user.username
    key: "username", //key for React efficient update
  },

];

const Dashboard: React.FC = () => { //defines dashboard component
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null); // users is a state variable that stores list of users fetched from server (initially null)
  // useLocalStorage hook example use
  // The hook returns an object with the value and two functions
  // Simply choose what you need from the hook:
  const {
    value: token,
    // set: setToken, // is commented out because we dont need to set or update the token value
    clear: clearToken, // all we need in this scenario is a method to clear the token
  } = useLocalStorage<string>("token", ""); // if you wanted to select a different token, i.e "lobby", useLocalStorage<string>("lobby", "");

  const handleLogout = async () => {
    // Clear token using the returned function 'clear' from the hook
    try {

      const response = await apiService.put<boolean>("/logout", {token});
      if (response) {
        clearToken();
        router.push("/login");
      } else {
        alert("Something went wrong during logout.");
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong while logging out:\n${error.message}`);
      } else {
        console.error("An unknown error occurred while logging out.");
      }
    }
  };

  useEffect(() => { //called when first rendered or when apiService changes
    const fetchUsers = async () => { //makes a Get request to users which then gets a response in form of a list of UsersGetDTO objects
      try {
        // apiService.get<User[]> returns the parsed JSON object directly,
        // thus we can simply assign it to our users variable.
        const users: User[] = await apiService.get<User[]>("/users");
        setUsers(users); //state change of state variable so React knows
        console.log("Fetched users:", users);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while fetching users:\n${error.message}`);
        } else {
          console.error("An unknown error occurred while fetching users.");
        }
      }
    };

    fetchUsers();
  }, [apiService]); // dependency apiService does not re-trigger the useEffect on every render because the hook uses memoization (check useApi.tsx in the hooks).
  // if the dependency array is left empty, the useEffect will trigger exactly once
  // if the dependency array is left away, the useEffect will run on every state change. Since we do a state change to users in the useEffect, this results in an infinite loop.
  // read more here: https://react.dev/reference/react/useEffect#specifying-reactive-dependencies

  return (
    <div className="card-container">
      <Card
        title="Dashboard"
        loading={!users} // is true when users is null
        className="dashboard-container"
      >
        {users && ( // renders when users have been fetched (not null anymore) (conditional rendering)
          <>
            {/* antd Table: pass the columns and data, plus a rowKey for stable row identity */}
            <Table<User>
              columns={columns} // defined above
              dataSource={users} // array of user objects
              rowKey="id"
              onRow={(row) => ({ // makes a row clickable and redirects user
                onClick: () => router.push(`/users/${row.id}`),
                style: { cursor: "pointer" },
              })}
            />
            <Button onClick={handleLogout} type="primary">
              Logout
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
