import {
  getAllAttributes,
  createAttribute,
  createAttributeValues,
  getAttributeValuesByAttributeId,
  getAttributesWithValues,
  deleteAllAttributes,
  deleteAttribute,
  updateAttribute,
  updateAttributeValue,
  deleteAttributeValue,
} from "@/controllers/AttributeController.js";
import { Router } from "express";

const router = Router();

router.get("/", getAllAttributes);
router.post("/", createAttribute);
router.put("/:attributeId", updateAttribute);
router.delete("/:attributeId", deleteAttribute);
router.delete("/", deleteAllAttributes);

router.get("/:attributeId/values", getAttributeValuesByAttributeId);
router.post("/:attributeId/values", createAttributeValues);
router.put("/values/:valueId", updateAttributeValue);
router.delete("/values/:valueId", deleteAttributeValue);

router.get("/with-values", getAttributesWithValues);
// [
//   {
//     "id": 1,
//     "name": "Chất liệu",
//     "code": "material",
//     "attributeValues": [
//       { "id": 101, "value": "Cotton", "sortOrder": 1 },
//       { "id": 102, "value": "Polyester", "sortOrder": 2 }
//     ]
//   },
//   {
//     "id": 2,
//     "name": "Cổ áo",
//     "code": "neckline",
//     "attributeValues": [
//       { "id": 201, "value": "Cổ Tròn", "sortOrder": 1 },
//       { "id": 202, "value": "V-Neck", "sortOrder": 2 }
//     ]
//   }
// ];

export default router;
