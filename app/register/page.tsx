"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi"; // hook starts with "use
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user"; // imports the defined structure of a User object
import { Button, Form, Input } from "antd";



// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";

interface FormFieldProps { //defines structure of a form field
    name: string;
    username: string;
    password: string;
    birthday: string;
}

const Register: React.FC = () => { // defines a React component Register that returns JSX(HTML)
    const router = useRouter(); // for navigation (redirecting user etc.)
    const apiService = useApi(); // for HTTP requests to server
    const [form] = Form.useForm(); // initializing form instance, extracting first element and assigning to variable form (list destructuring)
    // useLocalStorage hook example use
    // The hook returns an object with the value and two functions (set, clear)
    // Simply choose what you need from the hook:
    const {
        // value: token, // is commented out because we do not need the token value
        set: setToken, // extracting set attribute and renaming it setToken, we need this method to set the value of the token to the one we receive from the POST request to the backend server API
        // clear: clearToken, // is commented out because we do not need to clear the token when logging in
    } = useLocalStorage<string>("token", ""); // note that the key we are selecting is "token" and the default value we are setting is an empty string
    // if you want to pick a different token, i.e "usertoken", the line above would look as follows: } = useLocalStorage<string>("usertoken", "");

    const logInAfterRegistration= async (username: string, password: string) => { // awaiting function executed when Login submitted, takes in values in form of FormFields
        try {
            // Call the API service and let it handle JSON serialization and error handling
            const response = await apiService.post<User>("/login", {username, password}); // awaits the response of the POST to server with expected form of a User. It sends {values} (POST) to endpoint "/users"

            // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
            if (response.token != null) {
                setToken(response.token);
                return true;

            } return false;
        } catch (error) {
            if (error instanceof Error) {
                alert(`Something went wrong during the login:\n${error.message}`);
            } else {
                console.error("An unknown error occurred during login.");
            }
        }
    }


    const handleRegister = async (values: FormFieldProps) => {
        try {
            // Call the API service and let it handle JSON serialization and error handling
            const response = await apiService.post<User>("/users", values);

            if (response.username != null) {
                const loggedIn = await logInAfterRegistration(values.username, values.password);

                if (loggedIn) {
                    // Navigate to the user overview
                    router.push("/users/dashboard");
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("409")) {
                    alert(`Something went wrong during the registration:\n${error.message}`);
                }
            } else {
                console.error("An unknown error occurred during registration.");
            }
        }
    };




    return ( // returning the JSX (UI) Structure
        <div className="register-container">
            <Form //create a form with various attributes
                form={form} //binding form to the above defined form instance
                name="register"
                size="large"
                variant="outlined"
                onFinish={handleRegister} // handleRegister is executed when successfully submitted
                layout="vertical"
            >
                <Form.Item
                    name="name" // used to reference input value
                    label="Name" // what is displayed
                    rules={[{ required: true, message: "Please input your name!" }]}
                >
                    <Input placeholder="Enter name" />
                </Form.Item>
                <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: "Please input your username!" }]}
                >
                    <Input placeholder="Enter username" />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, message: "Please input your password!" }]}
                >
                    <Input placeholder="Enter password" />
                </Form.Item>
                <Form.Item
                    name="birthday"
                    label="Birthday"
                >
                    <Input placeholder="Enter birthday (optional)" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="register-button">
                        Register
                    </Button>
                </Form.Item>
                <Form.Item>
                    <Button
                        onClick = {() => router.push("/login")}>
                        Login
                    </Button>
                </Form.Item>
                <Form.Item>
                    <Button
                        onClick = {() => router.push("/")}>
                        Landing Page
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Register;

