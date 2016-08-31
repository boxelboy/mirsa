<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use BusinessMan\Bundle\JobBundle\Form\Type\ChildJobType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Console\Helper\ProgressBar;
use BusinessMan\Bundle\JobBundle\Entity\SalesOrderLineItem;
use Symfony\Component\HttpFoundation\Request;

/**
 * SalesOrderController
 *
 * @author Dave Hatch
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class SalesOrderLineItemController extends Controller
{
    /**
     * List all salesOrder
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     */
    public function listAction()
    {
        return $this->render('MirsaMirsaBundle:SalesOrderLineItem:list.html.twig');
    }

    /* Used to export the Stock records, this will also work with the filters */
    public function exportAction(Request $request)
    {
        $customer = $request->query->get('customer');
        $orderDate = $request->query->get('orderDate');
        $orderNumber = $request->query->get('orderNumber');
        $stockCode = $request->query->get('stockCode');
        $description = $request->query->get('description');
        $orderType = $request->query->get('orderType');

        $response = new StreamedResponse();
        $response->setCallback(function() use (&$customer, &$orderDate, &$orderNumber, &$stockCode, &$description, &$orderType) {
            $fc = fopen('php://output', 'w+');
            fputcsv($fc, array('Customer', 'Order Date', 'Order Number', 'Stk Code', 'Description', 'Order Type', 'Quantity'),',');
            $qb = $this->getDoctrine()->getRepository('MirsaMirsaBundle:SalesOrderLineItem');
            $qb = $qb->createQueryBuilder('soli');
            $qb = $qb->select('soli.customer,soli.orderDate,soli.orderNumber,soli.stockCode,soli.description,soli.orderType,soli.quantity');

            if ($customer != "" ) {
                $qb = $qb->andWhere('LOWER(soli.customer) LIKE :customer');
                $qb = $qb->setParameter('customer', '%' . strtolower($customer) . '%');
            }                        
            if ($orderDate != "" ) {
                $qb = $qb->andWhere('soli.orderDate = :orderDate');
                $qb = $qb->setParameter('orderDate', \DateTime::createFromFormat('m/d/Y', $orderDate), 'date');
            }
            if ($orderNumber != "" ) {
                $qb = $qb->andWhere('LOWER(soli.orderNumber) LIKE :orderNumber');
                $qb = $qb->setParameter('orderNumber', '%' . strtolower($orderNumber) . '%');
            }
            if ($stockCode != "" ) {
                $qb = $qb->andWhere('LOWER(soli.stockCode) LIKE :stockCode');
                $qb = $qb->setParameter('stockCode', '%' . strtolower($stockCode) . '%');
            }
            if ($description != "" ) {
                $qb = $qb->andWhere('LOWER(soli.description) LIKE :description');
                $qb = $qb->setParameter('description', '%' . strtolower($description) . '%');
            }
            if ($orderType != "" ) {
                $qb = $qb->andWhere('LOWER(soli.orderType) LIKE :orderType');
                $qb = $qb->setParameter('orderType', '%' . strtolower($orderType) . '%');
            }


            /* Only export the items  for the currently logged in client*/
            if (!is_null($this->getUser()->getContact())) { 
                if ($this->getUser()->getContact()->getClient()) {
                    $qb = $qb->andWhere('soli.client = :client');
                    $qb = $qb->setParameter('client', $this->getUser()->getContact()->getClient());
                }
            }
            $qb = $qb->getQuery();
            $salesOrderLineItems = $qb->getResult();

            foreach ($salesOrderLineItems as $item)
            {
                if (is_null($item['orderDate']))
                {
                    $formattedOrderDate = "";
                }
                else
                {
                    $formattedOrderDate = date_format($item['orderDate'], "m-d-Y");
                }

                fputcsv($fc, array($item['customer'],
                                   $formattedOrderDate,
                                   $item['orderNumber'],
                                   $item['stockCode'],
                                   $item['description'],
                                   $item['orderType'],
                                   $item['quantity']),
                         ',');
            }
            fclose($fc);
        });
        $filename = "sales_order_line_items_export_".date("m_d_Y_His").".csv";
        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition','attachment; filename=' . $filename);
        return $response;
    }
}