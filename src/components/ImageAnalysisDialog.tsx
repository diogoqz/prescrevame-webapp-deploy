
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface ImageAnalysisDialogProps {
  open: boolean;
  onClose: () => void;
  onAnalyze: (options: { prompt: string; model: string; temperature: number }) => void;
  imagePreview: string | null;
}

export const ImageAnalysisDialog: React.FC<ImageAnalysisDialogProps> = ({
  open,
  onClose,
  onAnalyze,
  imagePreview
}) => {
  const [prompt, setPrompt] = useState("Analise esta imagem em detalhes e descreva o que você vê.");
  const [model, setModel] = useState("gpt-4o");
  const [temperature, setTemperature] = useState(0.7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({ prompt, model, temperature });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Análise de Imagem com IA</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {imagePreview && (
            <div className="border rounded-md overflow-hidden h-40 flex justify-center">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="object-contain h-full w-auto"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt para análise</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="resize-none"
              rows={3}
              placeholder="Descreva o que você deseja saber sobre esta imagem"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model">Modelo de IA</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model">
                <SelectValue placeholder="Selecione o modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o (Padrão)</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini (Mais rápido)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="temperature">
              Temperatura: {temperature.toFixed(1)}
            </Label>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[temperature]}
              onValueChange={(values) => setTemperature(values[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Mais preciso</span>
              <span>Mais criativo</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-prescrevame">
              Analisar Imagem
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
