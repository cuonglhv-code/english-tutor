"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, MapPin, Phone, Mail, BarChart3, Target } from "lucide-react";
import { VN_CITIES, HALF_BANDS, TARGET_BANDS } from "@/lib/utils";
import type { WizardData } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(16, "Minimum age is 16").max(70, "Maximum age is 70"),
  address: z.string().min(1, "Please select a city"),
  mobile: z.string().regex(/^(\+84|84|0)[3-9]\d{8}$/, "Invalid Vietnamese mobile (+84 / 0 + 9 digits)"),
  email: z.string().email("Invalid email address"),
  listeningBand: z.string().min(1, "Required"),
  readingBand: z.string().min(1, "Required"),
  writingBand: z.string().min(1, "Required"),
  speakingBand: z.string().min(1, "Required"),
  targetBand: z.string().min(1, "Required"),
});

type Schema = z.infer<typeof schema>;

interface Props {
  data: Partial<WizardData>;
  onUpdate: (d: Partial<WizardData>) => void;
  onNext: () => void;
}

export function StepDetails({ data, onUpdate, onNext }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: data.name || "",
      age: data.age ? Number(data.age) : undefined,
      address: data.address || "",
      mobile: data.mobile || "",
      email: data.email || "",
      listeningBand: data.currentBands?.listening || "",
      readingBand: data.currentBands?.reading || "",
      writingBand: data.currentBands?.writing || "",
      speakingBand: data.currentBands?.speaking || "",
      targetBand: data.targetBand || "",
    },
  });

  const onSubmit = (values: Schema) => {
    onUpdate({
      name: values.name,
      age: String(values.age),
      address: values.address,
      mobile: values.mobile,
      email: values.email,
      currentBands: {
        listening: values.listeningBand,
        reading: values.readingBand,
        writing: values.writingBand,
        speaking: values.speakingBand,
      },
      targetBand: values.targetBand,
    });
    onNext();
  };

  const bandFields = [
    { key: "listeningBand" as const, label: "Listening" },
    { key: "readingBand" as const, label: "Reading" },
    { key: "writingBand" as const, label: "Writing" },
    { key: "speakingBand" as const, label: "Speaking" },
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-jaxtina-red" />
          <CardTitle>Personal Details</CardTitle>
        </div>
        <CardDescription>Tell us about yourself so we can personalise your feedback.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="Nguyen Van A" {...register("name")} />
              {errors.name && <p className="text-xs text-jaxtina-red">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="age">Age *</Label>
              <Input id="age" type="number" placeholder="22" {...register("age")} />
              {errors.age && <p className="text-xs text-jaxtina-red">{errors.age.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> City *
            </Label>
            <Select defaultValue={data.address} onValueChange={(v) => setValue("address", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent>
                {VN_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.address && <p className="text-xs text-jaxtina-red">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> Mobile *
              </Label>
              <Input placeholder="+84 9xx xxx xxx" {...register("mobile")} />
              {errors.mobile && <p className="text-xs text-jaxtina-red">{errors.mobile.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> Email *
              </Label>
              <Input type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-jaxtina-red">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" /> Current Band Scores *
            </Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {bandFields.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Select onValueChange={(v) => setValue(key, v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Band" />
                    </SelectTrigger>
                    <SelectContent>
                      {HALF_BANDS.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[key] && <p className="text-xs text-jaxtina-red">{errors[key]?.message}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="flex items-center gap-1">
              <Target className="h-3.5 w-3.5" /> Target Band *
            </Label>
            <Select defaultValue={data.targetBand} onValueChange={(v) => setValue("targetBand", v)}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Select target band" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_BANDS.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.targetBand && <p className="text-xs text-jaxtina-red">{errors.targetBand.message}</p>}
          </div>

          <Button type="submit" className="w-full" size="lg">
            Continue to Task Selection →
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
