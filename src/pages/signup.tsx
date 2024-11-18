import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { Register } from "@/redux/services/auth.service";
import { toast } from "react-toastify";
import signupimage from "../images/LoginAssets/synthesis8.jpg";

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
    <div className="bg-teal-900 min-h-screen">
      <div className=""><p className="mobile:text-3xl pad:text-4xl p-5 font-sarpanch font-bold pc:hidden"><span className="text-black font-extrabold"> / </span><span className="text-white">Synthesis</span></p></div>

        <div className="mobile:flex mobile:items-center mobile:justify-center pc:items-start mobile:mt-20 pc:mt-0">

        <div className="relative pc:w-1/2 drop-shadow-2xl rounded-full mobile:hidden pc:block">
            <img className="w-screen h-screen rounded-r-full " src={signupimage.src} alt="" />
            <div className="absolute inset-0"><p className="text-3xl p-10 font-sarpanch font-bold mobile:hidden pc:block"><span className="text-black font-extrabold"> / </span><span className="pc:text-teal-800 mobile:text-white">Synthesis</span></p></div>
        </div>

        <div className="pc:w-1/2">

          <div className="flex flex-col items-center font-sarpanch justify-center pad:mt-36 pc:mt-12 mobile:w-[24rem] pad:w-[50rem] pc:w-full">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-6 md:shadow-md md:rounded w-full md:max-w-md backdrop-blur-none bg-white/10"
            >
              <div className="text-2xl font-bold text-white text-center mb-3">
                <h2 className="text-black">Get Started</h2>
                <p>Let&aposs get you signed up!</p>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="First Name"
                  {...register("first_name", { required: "First name is required" })}
                  className={`w-full text-black font-bold p-3 border rounded focus:outline-none ${
                    errors.first_name ? "border-orange-500" : "focus:ring focus:ring-teal-600"
                  }`}
                />
                {errors.first_name && (
                  <p className="text-orange-500 text-sm mt-1 font-bold">{errors.first_name.message}</p>
                )}
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Last Name"
                  {...register("last_name", { required: "Last name is required" })}
                  className={`w-full text-black font-bold p-3 border rounded focus:outline-none ${
                    errors.last_name ? "border-orange-500" : "focus:ring focus:ring-teal-600"
                  }`}
                />
                {errors.last_name && (
                  <p className="text-orange-500 text-sm mt-1 font-bold">{errors.last_name.message}</p>
                )}
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
                {errors.email && <p className="text-orange-500 text-sm mt-1 font-bold">{errors.email.message}</p>}
              </div>

              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Password"
                  {...register("password", { required: "Password is required" })}
                  className={`w-full text-black font-bold p-3 border rounded focus:outline-none ${
                    errors.password ? "border-orange-500" : "focus:ring focus:ring-teal-600"
                  }`}
                />
                {errors.password && (
                  <p className="text-orange-500 text-sm mt-1 font-bold">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 text-white font-bold py-2 rounded hover:bg-teal-900 transition-all duration-500 ease-in-out"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Sign Up"}
              </button>

              <p className="text-center font-bold text-gray-200 mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-teal-300 hover:underline">
                  Login
                </Link>
              </p>
            </form>
        </div>
        </div>


      </div>
      
    </div>
    
  );
}
