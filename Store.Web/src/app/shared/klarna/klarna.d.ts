// src/app/shared/klarna/klarna.d.ts
declare global {
    interface Window {
        Klarna?: {
            Payments: {
                init: (config: { client_token: string }) => void;
                load: (
                    options: {
                        container: string;
                        payment_method_category?: string;
                    },
                    data: Record<string, unknown>,
                    callback: (response: { show_form: boolean; error?: any }) => void
                ) => void;
                authorize: (
                    options: Record<string, unknown>,
                    data: Record<string, unknown>,
                    callback: (response: {
                        authorization_token: string;
                        approved: boolean;
                        show_form: boolean;
                        error?: any;
                    }) => void
                ) => void;
            };
        };
    }
}

export { };