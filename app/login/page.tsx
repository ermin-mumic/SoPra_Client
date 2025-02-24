"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi"; // hook starts with "use
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user"; // imports the defined structure of a User object
import { Button, Form, Input } from "antd"; // imports UI components from Ant Design Library
// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";

interface FormFieldProps { //defines structure of a form field
  label: string;
  value: string;
}

const Login: React.FC = () => { // defines a React component Login that returns JSX(HTML)
  const router = useRouter(); // for navigation (redirecting user etc.)
  const apiService = useApi(); // for HTTP requests to server
  const [form] = Form.useForm(); // extracting first element and assigning to variabel form (list destructuring)
  // useLocalStorage hook example use
  // The hook returns an object with the value and two functions (set, clear)
  // Simply choose what you need from the hook:
  const {
    // value: token, // is commented out because we do not need the token value
    set: setToken, // extracting set attribute and renaming it setToken, we need this method to set the value of the token to the one we receive from the POST request to the backend server API
    // clear: clearToken, // is commented out because we do not need to clear the token when logging in
  } = useLocalStorage<string>("token", ""); // note that the key we are selecting is "token" and the default value we are setting is an empty string
  // if you want to pick a different token, i.e "usertoken", the line above would look as follows: } = useLocalStorage<string>("usertoken", "");

  const handleLogin = async (values: FormFieldProps) => { // awaiting function executed when Login submitted, takes in values in form of FormFields
    try {
      // Call the API service and let it handle JSON serialization and error handling
      const response = await apiService.post<User>("/users", { values }); // awaits the response of the POST to server with expected form of a User. It sends {values} (POST) to endpoint "/users"

      // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
      if (response.token) {
        setToken(response.token);
      }

      // Navigate to the user overview
      router.push("/users/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during the login:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during login.");
      }
    }
  };



  return ( // returning the JSX (UI) Structure
    <div className="login-container">
      <Form //create a form with various attributes
        form={form} //binding form to the above defined form instance
        name="login"
        size="large"
        variant="outlined"
        onFinish={handleLogin} // handleLogin is executed when successfully submitted
        layout="vertical"
      >
        <Form.Item
          name="username" // used to reference input value
          label="Username" // what is displayed
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
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            Login
          </Button>
        </Form.Item>
      </Form>
      <div>
        <span
            onClick = {() => router.push("/register")}>
          Register
        </span>
      </div>
    </div>
  );
};

export default Login;
