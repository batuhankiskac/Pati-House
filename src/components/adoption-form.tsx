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
import { submitAdoptionRequest } from '@/actions/auth';

const adoptionFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Tam adınız en az 2 karakter olmalıdır.' }),
  email: z.string().email({ message: 'Lütfen geçerli bir e-posta adresi girin.' }),
  phone: z.string().min(10, { message: 'Telefon numarası en az 10 rakam olmalıdır.' }),
  address: z.string().min(10, { message: 'Adres en az 10 karakter olmalıdır.' }),
  reason: z.string().min(20, { message: 'Lütfen bize biraz daha bilgi verin (en az 20 karakter).' }).max(500),
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
    try {
      const result = await submitAdoptionRequest({
        catName,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        reason: data.reason,
      });

      if (result.success) {
        toast({
          title: 'Başvurunuz Gönderildi!',
          description: `${catName} için sahiplenme başvurunuz alınmıştır. Yakında sizinle iletişime geçeceğiz!`,
          variant: 'default',
          duration: 5000,
        });

        // Gönderimden sonra ana sayfaya yönlendir
        router.push('/');
      } else {
        toast({
          title: 'Hata',
          description: result.error || 'Başvuru gönderilirken hata oluştu.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Beklenmeyen bir hata oluştu.',
        variant: 'destructive',
      });
    }
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
                    <FormLabel>Tam Adınız</FormLabel>
                    <FormControl>
                      <Input placeholder="Ad Soyad" {...field} />
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
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input placeholder="siz@ornek.com" {...field} />
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
                  <FormLabel>Telefon Numarası</FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 123-4567" {...field} />
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
                  <FormLabel>Tam Adres</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Ana Cad, Herhangibiryer, Türkiye" {...field} />
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
                  <FormLabel>{catName}'i neden sahiplenmek istiyorsunuz?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Bize evinizden, evcil hayvan deneyiminizden ve neden harika bir sahip olacağınızdan bahsedin."
                      className="resize-y min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                    Yaşam durumunuzu ve evcil hayvanlarla olan deneyiminizi kısaca açıklayın.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Gönderiliyor...' : `${catName} için Başvuruyu Gönder`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
