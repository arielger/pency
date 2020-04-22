import React from "react";
import {
  Stack,
  Flex,
  DrawerCloseButton,
  DrawerBody,
  DrawerHeader,
  DrawerContent,
  DrawerOverlay,
  DrawerFooter,
  Drawer,
  Divider,
  Text,
  Heading,
  Badge,
  Button,
  IconButton,
} from "@chakra-ui/core";
import template from "lodash.template";

import {useCart} from "../hooks";

import {groupBy} from "~/selectors/group";
import {useTenant} from "~/tenant/hooks";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<Props> = ({isOpen, onClose}) => {
  const {items, count, total, remove} = useCart();
  const {phone, message} = useTenant();
  const productsByCategory = Object.entries(groupBy(items, (item) => item.product.category));

  function send() {
    const compile = template(message);
    const text = compile({products: items});

    window.open(`https://wa.me/${phone}?text=${encodeURI(text)}`, "_blank");
  }

  React.useEffect(() => {
    if (!count) onClose();
  }, [count, onClose]);

  return (
    <Drawer id="cart" isOpen={isOpen} placement="right" size="md" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton right="8px" top="8px" />
        <DrawerHeader p={4}>Tu carrito ({count})</DrawerHeader>
        <DrawerBody overflowY="auto" p={4}>
          <Stack spacing={6}>
            {productsByCategory.map(([category, items]) => (
              <Stack key={category} spacing={6}>
                <Heading as="h4" size="md" textTransform="capitalize">
                  {category}
                </Heading>
                {items.map(({id, product, count}) => (
                  <Flex key={id} alignItems="center" justifyContent="space-between">
                    <Flex alignItems="center" mr={2}>
                      <IconButton
                        isRound
                        aria-label="Borrar elemento"
                        fontSize="12px"
                        height="20px"
                        icon="minus"
                        minWidth="20px"
                        mr={2}
                        variantColor="red"
                        width="20px"
                        onClick={() => remove(id)}
                      />
                      <Text>{product.title}</Text>
                    </Flex>
                    <Flex alignItems="center">
                      {count > 1 && (
                        <Badge mr={2} variant="solid" variantColor="primary">
                          {count}
                        </Badge>
                      )}
                      <Text>${Number(product.price) * count}</Text>
                    </Flex>
                  </Flex>
                ))}
              </Stack>
            ))}
          </Stack>
        </DrawerBody>
        <DrawerFooter padding={2}>
          <Stack spacing={4} width="100%">
            <Divider />
            <Flex alignItems="center" justifyContent="flex-end">
              <Text fontSize="lg" fontWeight="600" mr={2}>
                Total:
              </Text>
              <Text fontSize="lg">${total}</Text>
            </Flex>
            <Button
              backgroundColor="primary.500"
              color="white"
              variantColor="primary"
              w="100%"
              onClick={send}
            >
              Pedir
            </Button>
          </Stack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CartDrawer;
