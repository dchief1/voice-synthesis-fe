import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { Register } from "@/redux/services/auth.service";
import { toast } from "react-toastify";

interface SignupFormInputs {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>();

  const onSubmit: SubmitHandler<SignupFormInputs> = async (data: SignupFormInputs) => {
    try {
      setIsLoading(true);
      const response = await Register(data);

      // Show success message
      toast.success(response.message);

      // Redirect to login or dashboard
      router.push("/login");
    } catch (error: any) {
      setIsLoading(false);
      toast.error(error?.response?.data?.message || "Registration failed");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white md:bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 md:bg-white md:shadow-md md:rounded w-full md:max-w-md"
      >
        <h2 className="text-2xl text-gray-700 font-bold text-center mb-6">Sign Up</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="First Name"
            {...register("first_name", { required: "First name is required" })}
            className={`w-full text-gray-500 p-3 border rounded focus:outline-none ${
              errors.first_name ? "border-red-500" : "focus:ring focus:ring-blue-200"
            }`}
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Last Name"
            {...register("last_name", { required: "Last name is required" })}
            className={`w-full text-gray-500 p-3 border rounded focus:outline-none ${
              errors.last_name ? "border-red-500" : "focus:ring focus:ring-blue-200"
            }`}
          />
          {errors.last_name && (
            <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required" })}
            className={`w-full text-gray-500 p-3 border rounded focus:outline-none ${
              errors.email ? "border-red-500" : "focus:ring focus:ring-blue-200"
            }`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: "Password is required" })}
            className={`w-full text-gray-500 p-3 border rounded focus:outline-none ${
              errors.password ? "border-red-500" : "focus:ring focus:ring-blue-200"
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Sign Up"}
        </button>

        <p className="text-center text-gray-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
