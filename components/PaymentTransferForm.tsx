'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTransfer } from '@/lib/actions/dwolla.actions';
import { createTransaction } from '@/lib/actions/bank.actions';
import { getBank, getBankByAccountId } from '@/lib/actions/bank.actions';
import { decryptId } from '@/lib/utils';
import BankDropdown from './BankDropdown';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const transferSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(4, 'Transfer note must be at least 4 characters'),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount, e.g. 5.00')
    .refine((v) => Number(v) > 0, 'Amount must be greater than zero'),
  senderBank: z.string().min(4, 'Please select a valid bank account'),
  sharableId: z.string().min(8, 'Please enter a valid sharable ID'),
});

type TransferFormValues = z.infer<typeof transferSchema>;

const PaymentTransferForm = ({ accounts }: { accounts: Account[] }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      name: '',
      email: '',
      amount: '',
      senderBank: '',
      sharableId: '',
    },
  });

  const submit = async (data: TransferFormValues) => {
    setIsLoading(true);
    try {
      const receiverAccountId = decryptId(data.sharableId);
      const receiverBank = await getBankByAccountId({ accountId: receiverAccountId });
      const senderBank = await getBank({ documentId: data.senderBank });

      if (!receiverBank || !senderBank) {
        toast({
          variant: 'destructive',
          title: 'Transfer failed',
          description: 'Could not find bank account. Please check the sharable ID.',
        });
        return;
      }

      const transferParams: TransferParams = {
        sourceFundingSourceUrl: senderBank.fundingSourceUrl,
        destinationFundingSourceUrl: receiverBank.fundingSourceUrl,
        amount: data.amount,
      };

      const transfer = await createTransfer(transferParams);

      if (!transfer) {
        toast({
          variant: 'destructive',
          title: 'Transfer failed',
          description:
            'The transfer could not be completed. Both accounts need a verified funding source.',
        });
        return;
      }

      {
        await createTransaction({
          name: data.name,
          amount: data.amount,
          senderId: senderBank.userId,
          senderBankId: senderBank.$id,
          receiverId: receiverBank.userId,
          receiverBankId: receiverBank.$id,
          email: data.email,
        });

        toast({
          variant: 'success',
          title: 'Transfer complete',
          description: 'Your funds are on the way.',
        });

        form.reset();
        router.push('/');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        variant: 'destructive',
        title: 'Transfer failed',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-5">
      <div className="payment-transfer_form-details">
        <h2 className="text-18 font-semibold text-gray-900">Bank account details</h2>
        <p className="text-16 font-normal text-gray-600">
          Enter the bank account details of the recipient
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-14 font-medium text-gray-700">Select Source Bank</label>
        <BankDropdown
          accounts={accounts}
          setValue={form.setValue}
          otherStyles="!w-full"
        />
        {form.formState.errors.senderBank && (
          <p className="text-12 text-red-500">{form.formState.errors.senderBank.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-14 font-medium text-gray-700">Transfer Note</label>
        <textarea
          {...form.register('name')}
          placeholder="Write a short note here"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
        />
        {form.formState.errors.name && (
          <p className="text-12 text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="payment-transfer_form-details">
        <h2 className="text-18 font-semibold text-gray-900">Bank account details</h2>
        <p className="text-16 font-normal text-gray-600">
          Enter the bank account details of the recipient
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-14 font-medium text-gray-700">Recipient Email Address</label>
        <input
          type="email"
          {...form.register('email')}
          placeholder="ex: johndoe@gmail.com"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {form.formState.errors.email && (
          <p className="text-12 text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-14 font-medium text-gray-700">Recipient Bank Account ID</label>
        <input
          type="text"
          {...form.register('sharableId')}
          placeholder="Enter the public account number"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {form.formState.errors.sharableId && (
          <p className="text-12 text-red-500">{form.formState.errors.sharableId.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-14 font-medium text-gray-700">Amount</label>
        <input
          type="number"
          step="0.01"
          {...form.register('amount')}
          placeholder="ex: 5.00"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {form.formState.errors.amount && (
          <p className="text-12 text-red-500">{form.formState.errors.amount.message}</p>
        )}
      </div>

      <div className="payment-transfer_btn-box">
        <Button
          type="submit"
          disabled={isLoading}
          className="payment-transfer_btn bg-bank-gradient w-full"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin mr-2" /> Sending...
            </>
          ) : (
            'Transfer Funds'
          )}
        </Button>
      </div>
    </form>
  );
};

export default PaymentTransferForm;
