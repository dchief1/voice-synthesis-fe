import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { LoginUser } from "@/redux/services/auth.service";
import { toast } from "react-toastify";
import loginimage from "../images/LoginAssets/synthesis9.jpg";

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
    <div className="bg-teal-900 min-h-screen">
      <div><p className="text-3xl pad:text-4xl p-5 font-sarpanch font-bold pc:hidden"><span className="text-black font-extrabold"> / </span><span className="text-white">Synthesis</span></p></div>
      <div className="mobile:flex mobile:items-center mobile:justify-center pc:items-start mobile:mt-20 pc:mt-0">

        <div className="pc:w-1/2">
          <div><p className="text-3xl p-10 font-sarpanch font-bold mobile:hidden pc:block"><span className="text-black font-extrabold"> / </span><span className="text-white">Synthesis</span></p></div>

          <div className="flex flex-col items-center font-sarpanch justify-center mobile:mt-32 pc:mt-20 pad:w-[50rem] pc:w-full">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-6 md:shadow-md md:rounded-lg w-full md:max-w-md backdrop-blur-none bg-white/10"
            >
              <div className="text-2xl font-bold text-white text-center mb-3">
                {/* <h2 className="text-slate-950">Get Started</h2> */}
                <p>Welcome back to Sythesis!</p>
              </div>
              

              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email"
                  {...register("email", { required: "Email is required" })}
                  className={`w-full text-black font-bold p-3 border rounded focus:outline-none ${
                    errors.email ? "border-orange-500" : "focus:ring focus:ring-teal-600"
                  }`}
                />
                {errors.email && <p className="text-orange-500 font-bold text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Password"
                  {...register("password", { required: "Password is required" })}
                  className={`w-full text-black font-bold p-3 text-gray-500 border rounded focus:outline-none ${
                    errors.password ? "border-orange-500" : "focus:ring focus:ring-teal-600"
                  }`}
                />
                {errors.password && (
                  <p className="text-orange-500 font-bold text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 font-bold text-white text-xl font-sarpanch py-2 rounded hover:bg-teal-900 transition-all duration-500 ease-in-out"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>

              <p className="text-center font-bold text-gray-200 mt-4">
                Don’t have an account?{" "}
                <Link href="/signup" className="text-teal-300 hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>

        <div className="w-1/2 drop-shadow-2xl rounded-full mobile:hidden pc:block">
          <img className="w-screen h-screen rounded-l-full " src={loginimage.src} alt="" />
        </div>
      </div>
      
    </div>
  );
}
