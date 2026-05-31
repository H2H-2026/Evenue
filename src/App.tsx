import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "@/router";
import { useTheme } from "@/stores/theme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastContainer } from "@/components/ToastContainer";

import { useRegistrations } from "@/stores/registrations";
import { useAttendance } from "@/stores/attendance";
import { useFeedback } from "@/stores/feedback";

const queryClient = new QueryClient();

export default function App() {
  const apply = useTheme((s) => s.apply);
  const subscribeRegistrations = useRegistrations((s) => s.subscribeRealtime);
  const subscribeAttendance = useAttendance((s) => s.subscribeRealtime);
  const subscribeFeedback = useFeedback((s) => s.subscribeRealtime);

  useEffect(() => {
    apply();
    
    const unsubReg = subscribeRegistrations();
    const unsubAtt = subscribeAttendance();
    const unsubFeed = subscribeFeedback();

    return () => {
      unsubReg();
      unsubAtt();
      unsubFeed();
    };
  }, [apply, subscribeRegistrations, subscribeAttendance, subscribeFeedback]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
        <ToastContainer />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

