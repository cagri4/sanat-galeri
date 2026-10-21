-- Panolar: eser başına en fazla 6 fotoğraf (ABLAM-UART-ISTEK-2). SİLME YOK. Geri alma: -GERI-AL.sql
BEGIN;
UPDATE product_images SET is_visible = false WHERE id IN (600, 603, 605, 609, 610, 613, 617, 618, 619, 200, 205, 206, 207, 621, 623, 625, 169, 170, 173, 175, 178, 249, 250, 180, 183, 184, 185, 186, 189, 196, 227, 228, 230, 233, 234, 235, 236, 238, 239, 240, 242, 243, 209, 212, 213, 214, 215, 216, 220, 221, 222, 223, 224, 225);
COMMIT;
