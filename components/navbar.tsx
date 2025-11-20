"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { LogoMoby } from "@/components/ui/logo";
import { UnauthorizedAlert } from "@/components/ui/unauthorized-alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Menu, 
  X, 
  ChevronDown,
  BarChart3,
  BookOpen,
  Users,
  Phone
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-1">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <LogoMoby size="md" href="/" />
          <ModeToggle />
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 text-sm md:text-base">
                Produto <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem>
                <Link href="/como-funciona" className="flex w-full items-center gap-2 text-sm">
                  <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                  <span>Como Funciona</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/recursos" className="flex w-full items-center gap-2 text-sm">
                  <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
                  <span>Recursos</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <button 
            onClick={() => setShowUnauthorizedAlert(true)}
            className="text-foreground/80 hover:text-foreground transition-colors text-sm md:text-base"
          >
            Parceiros
          </button>
          
          <Link href="/blog" className="text-foreground/80 hover:text-foreground transition-colors text-sm md:text-base">
            Blog
          </Link>
          
          <Link href="/contato" className="text-foreground/80 hover:text-foreground transition-colors text-sm md:text-base flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            Contato
          </Link>
        </nav>
        
        <div className="hidden md:flex items-center gap-3">
          <Link href="/demo">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs md:text-sm h-9 px-4 flex items-center justify-center">
              DEMONSTRAÇÃO GRATUITA
            </Button>
          </Link>
          <div className="flex items-center">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="text-xs md:text-sm flex items-center gap-1 h-9 justify-center hover:bg-primary hover:text-white hover:border-primary">
                <Users className="h-3.5 w-3.5" /> 
                Login
              </Button>
            </Link>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help ml-1">
                    <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">i</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>Login liberado, conheça a área protegida do Moby, CRM com IA treinada em dados do mercado imobiliário brasileiro.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
            className="h-8 w-8"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border py-3 px-4 bg-background">
          <nav className="flex flex-col gap-2 md:gap-4">
            <div className="border-b border-border pb-2 mb-2">
              <h3 className="font-medium text-sm mb-2">Produto</h3>
              <Link 
                href="/como-funciona" 
                className="flex items-center gap-2 py-1.5 text-sm pl-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Como Funciona</span>
              </Link>
              <Link 
                href="/recursos" 
                className="flex items-center gap-2 py-1.5 text-sm pl-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                <span>Recursos</span>
              </Link>
            </div>
            
            <div className="flex flex-col gap-2">
              <button 
                className="flex items-center gap-2 py-2 text-sm w-full text-left"
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowUnauthorizedAlert(true);
                }}
              >
                <Users className="h-4 w-4" />
                <span>Parceiros</span>
              </button>
              
              <Link 
                href="/blog" 
                className="flex items-center gap-2 py-2 text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                <span>Blog</span>
              </Link>
              
              <Link 
                href="/contato" 
                className="flex items-center gap-2 py-2 text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <Phone className="h-4 w-4" />
                <span>Contato</span>
              </Link>
            </div>
            
            <div className="border-t border-border mt-2 pt-4 flex flex-col gap-3">
              <Link href="/demo" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white text-sm h-9 flex items-center justify-center">
                  DEMONSTRAÇÃO GRATUITA
                </Button>
              </Link>
              
              <div className="w-full flex items-center">
                <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex-1">
                  <Button variant="outline" className="w-full text-sm flex items-center justify-center gap-1 h-9 hover:bg-primary hover:text-white hover:border-primary">
                    <Users className="h-3.5 w-3.5" />
                    Login
                  </Button>
                </Link>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help ml-2">
                        <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">i</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p>Login liberado, conheça a área protegida do Moby, CRM IA treinada com dados de mercado imobiliário brasileiro.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
    
    {/* Alerta de não autorizado */}
    <UnauthorizedAlert 
      isOpen={showUnauthorizedAlert} 
      onClose={() => setShowUnauthorizedAlert(false)} 
    />
    </>
  );
}