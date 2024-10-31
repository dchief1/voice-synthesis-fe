import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { LoginUser } from "@/redux/services/auth.service";
import { toast } from "react-toastify";

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data: LoginFormInputs) => {
    try {
      setIsLoading(true);
      const response = await LoginUser(data);

      toast.success(response.message);

      router.push("/conversation");
    } catch (error: any) {
      setIsLoading(false);
      toast.error(error?.response?.data?.message || "Login failed");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center bg-white justify-center min-h-screen md:bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 md:bg-white md:shadow-md md:rounded w-full md:max-w-md"
      >
        <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">Login</h2>

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
            className={`w-full p-3 text-gray-500 border rounded focus:outline-none ${
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
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-gray-500 mt-4">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
