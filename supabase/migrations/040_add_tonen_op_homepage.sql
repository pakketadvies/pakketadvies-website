-- Add tonen_op_homepage field to contracten table
-- This field determines which contracts are shown in the homepage carousel

ALTER TABLE contracten 
ADD COLUMN IF NOT EXISTS tonen_op_homepage BOOLEAN DEFAULT false;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_contracten_tonen_op_homepage ON contracten(tonen_op_homepage) WHERE tonen_op_homepage = true;

-- Comment
COMMENT ON COLUMN contracten.tonen_op_homepage IS 'Determines if this contract should be shown in the homepage carousel';

