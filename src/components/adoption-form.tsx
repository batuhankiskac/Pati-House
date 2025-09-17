'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { useSafeRouter } from '@/hooks/use-safe-router';
import { useRequests } from '@/hooks/use-requests';
import { ErrorBoundary } from '@/components/layout/error-boundary';
import { adoptionRequestSchema } from '@/lib/validation/requests';
import type { AdoptionRequestFormData } from '@/lib/validation/requests';

type AdoptionFormValues = AdoptionRequestFormData;

interface AdoptionFormProps {
  catName: string;
}

export default function AdoptionForm({ catName }: AdoptionFormProps) {
  const { toast } = useToast();
  const router = useSafeRouter();

  const form = useForm<AdoptionFormValues>({
    resolver: zodResolver(adoptionRequestSchema),
    defaultValues: {
      catName: '',
      fullName: '',
      email: '',
      phone: '',
      address: '',
      reason: '',
    },
  });

  const { createRequest } = useRequests();

  async function onSubmit(data: AdoptionFormValues) {
    try {
      const result = await createRequest({
        catName: catName,
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
    <ErrorBoundary>
      <Card
        role="form"
        aria-label={`${catName} için sahiplenme formu`}
      >
        <CardContent className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
              aria-describedby="form-description"
            >
              <p id="form-description" className="sr-only">
                {catName} için sahiplenme başvurusu yapmak için aşağıdaki formu doldurunuz.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        htmlFor={field.name}
                        aria-required="true"
                      >
                        Tam Adınız
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ad Soyad"
                          {...field}
                          className="text-base md:text-sm"
                          aria-describedby={form.formState.errors.fullName ? `${field.name}-error` : undefined}
                        />
                      </FormControl>
                      {form.formState.errors.fullName && (
                        <FormMessage
                          id={`${field.name}-error`}
                          role="alert"
                          aria-live="assertive"
                        />
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        htmlFor={field.name}
                        aria-required="true"
                      >
                        E-posta
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="siz@ornek.com"
                          {...field}
                          className="text-base md:text-sm"
                          aria-describedby={form.formState.errors.email ? `${field.name}-error` : undefined}
                        />
                      </FormControl>
                      {form.formState.errors.email && (
                        <FormMessage
                          id={`${field.name}-error`}
                          role="alert"
                          aria-live="assertive"
                        />
                      )}
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor={field.name}
                      aria-required="true"
                    >
                      Telefon Numarası
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(555) 123-4567"
                        {...field}
                        aria-describedby={form.formState.errors.phone ? `${field.name}-error` : undefined}
                      />
                    </FormControl>
                    {form.formState.errors.phone && (
                      <FormMessage
                        id={`${field.name}-error`}
                        role="alert"
                        aria-live="assertive"
                      />
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor={field.name}
                      aria-required="true"
                    >
                      Tam Adres
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Ana Cad, Herhangibiryer, Türkiye"
                        {...field}
                        aria-describedby={form.formState.errors.address ? `${field.name}-error` : undefined}
                      />
                    </FormControl>
                    {form.formState.errors.address && (
                      <FormMessage
                        id={`${field.name}-error`}
                        role="alert"
                        aria-live="assertive"
                      />
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor={field.name}
                      aria-required="true"
                    >
                      {catName}'i neden sahiplenmek istiyorsunuz?
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Bize evinizden, evcil hayvan deneyiminizden ve neden harika bir sahip olacağınızdan bahsedin."
                        className="resize-y min-h-[120px]"
                        {...field}
                        aria-describedby={form.formState.errors.reason ? `${field.name}-error` : undefined}
                      />
                    </FormControl>
                     <FormDescription>
                      Yaşam durumunuzu ve evcil hayvanlarla olan deneyiminizi kısaca açıklayın.
                    </FormDescription>
                    {form.formState.errors.reason && (
                      <FormMessage
                        id={`${field.name}-error`}
                        role="alert"
                        aria-live="assertive"
                      />
                    )}
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="lg"
                className="w-full bg-accent hover:bg-accent/90"
                disabled={form.formState.isSubmitting}
                aria-busy={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <span className="sr-only">Gönderiliyor</span>
                    Gönderiliyor...
                  </>
                ) : (
                  `${catName} için Başvuruyu Gönder`
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}
