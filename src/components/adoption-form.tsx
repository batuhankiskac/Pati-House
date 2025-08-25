'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const adoptionFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  address: z.string().min(10, { message: 'Address must be at least 10 characters.' }),
  reason: z.string().min(20, { message: 'Please tell us a bit more (at least 20 characters).' }).max(500),
});

type AdoptionFormValues = z.infer<typeof adoptionFormSchema>;

interface AdoptionFormProps {
  catName: string;
}

export default function AdoptionForm({ catName }: AdoptionFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<AdoptionFormValues>({
    resolver: zodResolver(adoptionFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      reason: '',
    },
  });

  async function onSubmit(data: AdoptionFormValues) {
    // In a real app, you would send this data to your backend.
    console.log('Adoption Application Submitted:', { catName, ...data });

    toast({
      title: 'Application Sent!',
      description: `Your adoption application for ${catName} has been submitted. We'll be in touch soon!`,
      variant: 'default',
      duration: 5000,
    });
    
    // Redirect to home page after submission
    router.push('/');
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="(123) 456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, Anytown, USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you want to adopt {catName}?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your home, your experience with pets, and why you'd be a great fit."
                      className="resize-y min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                    Briefly describe your living situation and experience with pets.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Submitting...' : `Submit Application for ${catName}`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
