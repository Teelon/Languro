"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SocialSignIn from "../SocialSignIn";
import SwitchOption from "../SwitchOption";
import { useState } from "react";
import MagicLink from "../MagicLink";
import Loader from "@/components/Common/Loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/Common/Logo";

const SignUp = () => {
  const router = useRouter();
  const [isPassword, setIsPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    setLoading(true);
    const data = new FormData(e.currentTarget);
    const value = Object.fromEntries(data.entries());
    const finalData = { ...value };

    fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(finalData),
    })
      .then((res) => res.json())
      .then((data) => {
        toast.success("Successfully registered");
        setLoading(false);
        router.push("/signin");
      })
      .catch((err) => {
        toast.error(err.message);
        setLoading(false);
      });
  };

  return (
    <section className="bg-[#F4F7FF] py-14 dark:bg-dark lg:py-[90px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <Card className="mx-auto max-w-[500px] border-none shadow-none text-center">
              <CardContent className="p-4 md:p-12">
                <div className="mb-10 text-center">
                  <Logo className="mx-auto" />
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
                  <form onSubmit={handleSubmit}>
                    <div className="mb-[22px]">
                      <Input
                        type="text"
                        placeholder="Name"
                        name="name"
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="mb-[22px]">
                      <Input
                        type="email"
                        placeholder="Email"
                        name="email"
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="mb-[22px]">
                      <Input
                        type="password"
                        placeholder="Password"
                        name="password"
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="mb-9">
                      <Button
                        type="submit"
                        className="w-full"
                      >
                        Sign Up {loading && <Loader />}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <MagicLink />
                )}

                <p className="text-body-secondary mb-4 text-base">
                  By creating an account you are agree with our{" "}
                  <Link href="/#" className="text-primary hover:underline">
                    Privacy
                  </Link>{" "}
                  and{" "}
                  <Link href="/#" className="text-primary hover:underline">
                    Policy
                  </Link>
                </p>

                <p className="text-body-secondary text-base">
                  Already have an account?
                  <Link
                    href="/signin"
                    className="pl-2 text-primary hover:underline"
                  >
                    Sign In
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

export default SignUp;
