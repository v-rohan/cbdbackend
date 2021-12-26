import model from "../models/index";

const { Store } = model;

const getStores = async (_, res) => {
  try {
    const stores = await Store.findAll();
    res.status(200).json({ stores });
  } catch (err) {
    console.log(err);
    res.status(400);
  }
};

const addStore = async (req, res) => {
  const {
    name,
    homepage,
    cashbackEnabled,
    cashbackPercent,
    cashbackType,
    network,
    featured,
    isClaimable,
    description,
  } = req.body;
  try {
    const store = Store.create({});
    res.status(201).send({ store });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Store not created" });
  }
};

export { getStores, addStore };
