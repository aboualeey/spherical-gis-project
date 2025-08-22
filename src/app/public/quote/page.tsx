"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
export default function Quote() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      message: "",
      terms: false,
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("Required"),
      lastName: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email address").required("Required"),
      phone: Yup.string().required("Required"),
      address: Yup.string().required("Required"),
      city: Yup.string().required("Required"),
      state: Yup.string().required("Required"),
      zip: Yup.string().required("Required"),
      country: Yup.string().required("Required"),
      message: Yup.string().required("Required"),
      terms: Yup.boolean().oneOf([true], "Must accept terms and conditions"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await fetch("/api/quote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        if (!response.ok) {
          throw new Error("Something went wrong");
        }
        toast.success("Quote submitted successfully");
        router.push("/");
      } catch (error) {
        toast.error("Something went wrong");
      }
      setLoading(false);
    },
  });
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Request a Quote</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.firstName}
                />
                {formik.touched.firstName && formik.errors.firstName ? (
                  <div className="text-red-500 text-sm">{formik.errors.firstName}</div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.lastName}
                />
                {formik.touched.lastName && formik.errors.lastName ? (
                  <div className="text-red-500 text-sm">{formik.errors.lastName}</div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-red-500 text-sm">{formik.errors.email}</div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.phone}
                />
                {formik.touched.phone && formik.errors.phone ? (
                  <div className="text-red-500 text-sm">{formik.errors.phone}</div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.address}
                />
                {formik.touched.address && formik.errors.address ? (
                  <div className="text-red-500 text-sm">{formik.errors.address}</div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.city}
                />
                {formik.touched.city && formik.errors.city ? (
                  <div className="text-red-500 text-sm">{formik.errors.city}</div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.state}
                />
                {formik.touched.state && formik.errors.state ? (
                  <div className="text-red-500 text-sm">{formik.errors.state}</div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  name="zip"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.zip}
                />
                {formik.touched.zip && formik.errors.zip ? (
                  <div className="text-red-500 text-sm">{formik.errors.zip}</div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.country}
                />
                {formik.touched.country && formik.errors.country ? (
                  <div className="text-red-500 text-sm">{formik.errors.country}</div>
                ) : null}
              </div>
            </div>
            <div className="space-y-2 mt-6">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.message}
              />
              {formik.touched.message && formik.errors.message ? (
                <div className="text-red-500 text-sm">{formik.errors.message}</div>
              ) : null}
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <Checkbox
                id="terms"
                name="terms"
                checked={formik.values.terms}
                onCheckedChange={(checked) => formik.setFieldValue("terms", checked)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the terms and conditions
              </label>
            </div>
            {formik.touched.terms && formik.errors.terms ? (
              <div className="text-red-500 text-sm mt-2">{formik.errors.terms}</div>
            ) : null}
            <Button type="submit" className="mt-6" disabled={loading}>
              <Carousel
                items={[
                  { src: '/Geo-spatial1.jpeg', alt: 'Spherical GIS Solutions', caption: 'Innovative Geospatial Technology', type: 'image' },
                  { src: '/Geo-spatial2.jpg', alt: 'GIS & Remote Sensing', caption: 'Advanced Spatial Analysis', type: 'image' },
                  { src: '/carousel-3.svg', alt: 'Solar Energy Solutions', caption: 'Sustainable Power for the Future', type: 'image' }
                ]}
                className="h-[500px]"
              />
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-40">
                <div className="text-center text-white px-4">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">Request a Quote</h1>
                  <p className="text-xl max-w-3xl mx-auto">
                    Fill out the form below and our team will get back to you with a customized quote
                  </p>
                </div>
              </div>
            </div>
            {formik.touched.terms && formik.errors.terms ? (
              <div className="text-red-500 text-sm mt-2">{formik.errors.terms}</div>
            ) : null}
            <Button type="submit" className="mt-6" disabled={loading}>