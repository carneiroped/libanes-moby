import Link from "next/link";
import { LogoMoby } from "@/components/ui/logo";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#f9f7f2] dark:bg-muted/30 border-t">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <LogoMoby size="md" href="/" />
            <p className="text-muted-foreground text-xs md:text-sm">
              Revolucionando a gestão imobiliária com inteligência artificial desde 2023.
            </p>
            <div className="flex gap-4">
              <Link href="https://x.com/moby_casa" target="_blank" rel="noopener noreferrer" aria-label="X/Twitter">
                <Twitter className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </Link>
              <Link href="https://www.facebook.com/profile.php?id=61573678783645" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </Link>
              <Link href="https://www.instagram.com/moby_ia/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </Link>
              <Link href="https://www.linkedin.com/company/moby-ecossistema-imobiliario/about/?viewAsMember=true" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3 md:mb-4 text-sm md:text-base">Produto</h3>
            <ul className="space-y-1 md:space-y-2">
              <li>
                <Link href="/como-funciona" className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                  Como funciona
                </Link>
              </li>
              <li>
                <Link href="/recursos" className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                  Recursos
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                  Demonstração
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3 md:mb-4 text-sm md:text-base">Recursos</h3>
            <ul className="space-y-1 md:space-y-2">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/calculadora" className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                  Calculadora de ROI
                </Link>
              </li>
              <li>
                <Link href="/parceiros" className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                  Programa de parceiros
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3 md:mb-4 text-sm md:text-base">Empresa</h3>
            <ul className="space-y-1 md:space-y-2">
              <li>
                <Link href="/sobre" className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/carreiras" className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                  Carreiras
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                  Política de privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                  Termos de uso
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs md:text-sm text-muted-foreground">
            &copy; {currentYear} Moby Tecnologia. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 md:gap-6 mt-4 md:mt-0">
            <Link href="/privacidade" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacidade
            </Link>
            <Link href="/termos" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Termos
            </Link>
            <Link href="/cookies" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}