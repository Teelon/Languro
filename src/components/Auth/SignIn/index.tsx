"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import SocialSignIn from "../SocialSignIn";
import SwitchOption from "../SwitchOption";
import MagicLink from "../MagicLink";
import Loader from "@/components/Common/Loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Signin = () => {
  const router = useRouter();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    checkboxToggle: false,
  });

  const [isPassword, setIsPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginUser = (e: any) => {
    e.preventDefault();

    setLoading(true);
    signIn("credentials", { ...loginData, redirect: false })

      .then((callback) => {
        if (callback?.error) {
          toast.error(callback?.error);
          console.log(callback?.error);
          setLoading(false);
          return;
        }

        if (callback?.ok && !callback?.error) {
          toast.success("Login successful");
          setLoading(false);
          router.push("/dashboard");
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log(err.message);
        toast.error(err.message);
      });
  };

  return (
    <section className="bg-[#F4F7FF] py-14 dark:bg-dark lg:py-20">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <Card className="mx-auto max-w-[500px] border-none shadow-none text-center">
              <CardContent className="p-4 md:p-12">
                <div className="mb-10 text-center">
                  <Link href="/" className="mx-auto inline-block max-w-[160px]">
                    <Image
                      src="/images/logo/logo.svg"
                      alt="logo"
                      width={140}
                      height={30}
                      className="dark:hidden"
                    />
                    <Image
                      src="/images/logo/logo-white.svg"
                      alt="logo"
                      width={140}
                      height={30}
                      className="hidden dark:block"
                    />
                  </Link>
                </div>

                <SocialSignIn />

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t dark:border-dark-3" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-body-secondary dark:bg-card">
                      OR
                    </span>
                  </div>
                </div>

                <SwitchOption
                  isPassword={isPassword}
                  setIsPassword={setIsPassword}
                />

                {isPassword ? (
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="mb-[22px]">
                      <Input
                        type="email"
                        placeholder="Email"
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="mb-[22px]">
                      <Input
                        type="password"
                        placeholder="Password"
                        onChange={(e) =>
                          setLoginData({ ...loginData, password: e.target.value })
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="mb-9">
                      <Button
                        onClick={loginUser}
                        type="submit"
                        className="w-full"
                      >
                        Sign In {loading && <Loader />}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <MagicLink />
                )}

                <Link
                  href="/forgot-password"
                  className="mb-2 inline-block text-base text-dark hover:text-primary dark:text-white dark:hover:text-primary"
                >
                  Forget Password?
                </Link>
                <p className="text-body-secondary text-base">
                  Not a member yet?{" "}
                  <Link href="/signup" className="text-primary hover:underline">
                    Sign Up
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signin;
