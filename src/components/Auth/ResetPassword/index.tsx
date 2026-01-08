"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ResetPassword = ({ token }: { token: string }) => {
  const [data, setData] = useState({
    newPassword: "",
    ReNewPassword: "",
  });
  const [loader, setLoader] = useState(false);

  const [user, setUser] = useState({
    email: "",
  });

  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await axios.post(`/api/forgot-password/verify-token`, {
          token,
        });

        if (res.status === 200) {
          setUser({
            email: res.data.email,
          });
        }
      } catch (error: any) {
        toast.error(error?.response?.data || "Invalid or expired token.");
        router.push("/forgot-password");
      }
    };

    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (data.newPassword === "") {
      toast.error("Please enter your new password.");
      return;
    }

    if (data.newPassword !== data.ReNewPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoader(true);

    try {
      const res = await axios.post(`/api/forgot-password/update`, {
        email: user?.email,
        password: data.newPassword,
      });

      if (res.status === 200) {
        toast.success(res.data);
        setData({ newPassword: "", ReNewPassword: "" });
        router.push("/signin");
      }

      setLoader(false);
    } catch (error: any) {
      toast.error(error?.response?.data || "Failed to update password.");
      setLoader(false);
    }
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

                <h2 className="mb-4 text-2xl font-bold text-dark dark:text-white sm:text-3xl">
                  Set New Password
                </h2>
                <p className="mb-10 text-base text-body-secondary">
                  Please enter and confirm your new password below.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="mb-[22px]">
                    <Input
                      type="password"
                      placeholder="New password"
                      name="newPassword"
                      value={data?.newPassword}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="mb-[22px]">
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      name="ReNewPassword"
                      value={data?.ReNewPassword}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="mb-9">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loader}
                    >
                      Update Password {loader && <Loader />}
                    </Button>
                  </div>
                </form>

                <p className="text-body-secondary text-base">
                  Remember your password?{" "}
                  <Link href="/signin" className="text-primary hover:underline font-medium">
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

export default ResetPassword;
