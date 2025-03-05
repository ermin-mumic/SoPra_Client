"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import {useParams, useRouter} from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi"; // hook starts with "use
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Form, Input } from "antd";



// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";

interface FormFieldProps { //defines structure of a form field
    username: string;
    birthday: string;
}

const Edit: React.FC = () => { // defines a React component Edit that returns JSX(HTML)
    const router = useRouter(); // for navigation (redirecting user etc.)
    const apiService = useApi(); // for HTTP requests to server
    const [form] = Form.useForm();// initializing form instance, extracting first element and assigning to variable form (list destructuring)
    const {id} = useParams(); // stores the id
    // useLocalStorage hook example use
    // The hook returns an object with the value and two functions (set, clear)
    // Simply choose what you need from the hook:
    const {
        //value: token, // is commented out because we do not need the token value
        // set: setToken, // extracting set attribute and renaming it setToken, we need this method to set the value of the token to the one we receive from the POST request to the backend server API
        // clear: clearToken, // is commented out because we do not need to clear the token when logging in
    } = useLocalStorage<string>("token", ""); // note that the key we are selecting is "token" and the default value we are setting is an empty string
    // if you want to pick a different token, i.e "usertoken", the line above would look as follows: } = useLocalStorage<string>("usertoken", "");

    const handleEdit = async (values: FormFieldProps) => {
        const data = {
            username : values.username,
            birthday : values.birthday || null // ensure if birthday empty to still send birthday as null for correct handling in backend
        }
        try {
            // Call the API service and let it handle JSON serialization and error handling
            console.log(values);
            await apiService.put<void>(`/users/${id}`, data);
            router.push(`/users/${id}`);

        } catch (error) {
            if (error instanceof Error) {
                alert(`Something went wrong during the edit:\n${error.message}`);
            } else {
                console.error("An unknown error occurred during edit.");
            }
        }
    };




    return ( // returning the JSX (UI) Structure
        <div className="edit-container">
            <Form //create a form with various attributes
                form={form} //binding form to the above defined form instance
                name="edit"
                size="large"
                variant="outlined"
                onFinish={handleEdit} // handleEdit is executed when successfully submitted
                layout="vertical"
            >
                <Form.Item
                    name="username" // used to reference input value
                    label="Username" // what is displayed
                    rules={[{ required: true, message: "Please input your new name!" }]}
                >
                    <Input placeholder="Enter new username" />
                </Form.Item>
                <Form.Item
                    name="birthday"
                    label="Birthday"
                >
                    <Input placeholder="Enter new birthday" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="edit-button"
                            >
                        Edit
                    </Button>
                </Form.Item>
                <Form.Item>
                    <Button
                        onClick = {() => router.push(`/users/${id}`)}>
                        User  Profile
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Edit;

