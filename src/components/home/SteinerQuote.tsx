import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

const SteinerQuote = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container max-w-3xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">{t('home.steiner_inspiration')}</span>
          </div>
          
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
            {t('home.steiner_title')}
          </h2>
          
          <blockquote className="text-lg md:text-xl text-muted-foreground leading-relaxed italic">
            {t('home.steiner_quote_1')}
          </blockquote>

          {isExpanded && (
            <div className="mt-6 animate-fade-up">
              <blockquote className="text-lg md:text-xl text-muted-foreground leading-relaxed italic">
                {t('home.steiner_quote_2')}
              </blockquote>
              <p className="mt-6 text-foreground leading-relaxed">
                {t('home.steiner_text')}
              </p>
            </div>
          )}

          <Button
            variant="ghost"
            size="lg"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-6 text-primary hover:text-primary/80"
          >
            {isExpanded ? (
              <>
                {t('home.steiner_close')} <ChevronUp className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                {t('home.steiner_read_more')} <ChevronDown className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SteinerQuote;
